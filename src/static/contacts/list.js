// متغیر سراسری برای دسترسی به API گرید
let gridApi = null;

// ۱. تابع کمکی استخراج DisplayOrder برای سورت درختی پایدار
function getDisplayOrder(data) {
    if (!data) return 999999;
    const order = data.DisplayOrder ?? data.displayOrder ?? data.display_order;
    const num = Number(order);
    return isNaN(num) ? 999999 : num;
}

// ۲. فرار از کاراکترهای خاص HTML برای امنیت XSS
function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ۳. رندر نوع شخص (حقیقی / حقوقی)
function renderContactTypeBadge(type) {
    const t = Number(type);
    if (t === 2) {
        return `<span class="badge" style="background:#e0e7ff; color:#3730a3; font-weight:500; font-size:11px; padding:3px 8px; border-radius:6px;">
                    <i class="bi bi-building me-1"></i>حقوقی
                </span>`;
    }
    return `<span class="badge" style="background:#f1f5f9; color:#475569; font-weight:500; font-size:11px; padding:3px 8px; border-radius:6px;">
                <i class="bi bi-person me-1"></i>حقیقی
            </span>`;
}

// ۴. رندر نقش‌های مالی (Vendor, Customer, Debtor/Creditor)
function renderRolesBadges(data) {
    if (!data) return "";
    let badges = [];

    if (data.isVendor) {
        badges.push(`<span class="badge" style="background:#fee2e2; color:#991b1b; font-size:10px; padding:2px 6px; border-radius:4px;">فروشنده</span>`);
    }
    if (data.isCustomer) {
        badges.push(`<span class="badge" style="background:#dcfce7; color:#166534; font-size:10px; padding:2px 6px; border-radius:4px;">مشتری/درآمد</span>`);
    }
    if (data.isDebtorCreditor) {
        badges.push(`<span class="badge" style="background:#fef3c7; color:#92400e; font-size:10px; padding:2px 6px; border-radius:4px;">طرف‌حساب/مالی</span>`);
    }

    if (badges.length === 0) {
        return `<span class="text-muted" style="font-size:11px;">—</span>`;
    }

    return `<div class="d-flex flex-wrap gap-1">${badges.join("")}</div>`;
}

// ۵. رندر برچسب‌ها (Tags) با رنگ اختصاصی
function renderTagsBadges(tags) {
    if (!tags || !Array.isArray(tags) || tags.length === 0) {
        return `<span class="text-muted" style="font-size:11px;">—</span>`;
    }

    return `<div class="d-flex flex-wrap gap-1 align-items-center">` + 
        tags.map(t => {
            const bg = t.colorHex ? `${t.colorHex}20` : '#f1f5f9';
            const color = t.colorHex || '#475569';
            return `<span class="badge" style="background:${bg}; color:${color}; border:1px solid ${color}40; font-size:11px; padding:2px 7px; border-radius:12px; font-weight:500;">
                        #${escapeHtml(t.name)}
                    </span>`;
        }).join("") + 
    `</div>`;
}

// ۶. رندرر دکمه‌های عملیات
function contactActionsRenderer(params) {
    const contact = params.data;
    if (!contact) return "";

    const isGroup = Boolean(contact.isGroup);
    const container = document.createElement("div");
    container.className = "d-flex align-items-center gap-1";

    let buttonsHtml = "";

    // اگر گروه باشد، دکمه افزودن زیرمجموعه دارد
    if (isGroup) {
        buttonsHtml += `
            <button
                type="button"
                class="btn btn-sm btn-icon btn-light-primary js-contact-add-child"
                data-contact-id="${escapeHtml(contact.id)}"
                data-contact-name="${escapeHtml(contact.name)}"
                title="افزودن مخاطب به این گروه">
                <i class="bi bi-person-plus"></i>
            </button>
        `;
    }

    // دکمه ویرایش
    buttonsHtml += `
        <button
            type="button" 
            class="btn btn-sm btn-icon btn-light-warning js-contact-edit"
            data-contact-id="${escapeHtml(contact.id)}"
            title="ویرایش مخاطب">
            <i class="bi bi-pencil"></i>
        </button>
    `;

    // دکمه حذف
    buttonsHtml += `
        <button
            type="button"
            class="btn btn-sm btn-icon btn-light-danger js-contact-delete"
            data-contact-id="${escapeHtml(contact.id)}"
            title="حذف مخاطب">
            <i class="bi bi-trash"></i>
        </button>
    `;

    container.innerHTML = buttonsHtml;
    return container;
}

// ۷. تابع ساخت مسیر سلسله‌مراتبی درختی (Tree Path Builder)
function mapTreeData(items) {
    const map = new Map();

    items.forEach(item => {
        const rawParent = item.parentId ?? item.ParentId;
        const isRoot = !rawParent || 
                       rawParent === "" || 
                       rawParent === "0" || 
                       rawParent === 0 || 
                       rawParent === "00000000-0000-0000-0000-000000000000" || 
                       rawParent === "NULL";

        map.set(String(item.id).toLowerCase(), {
            ...item,
            _normalizedParentId: isRoot ? null : String(rawParent).toLowerCase()
        });
    });

    return items.map(item => {
        const path = [];
        const visited = new Set();
        let curr = map.get(String(item.id).toLowerCase());

        while (curr && !visited.has(String(curr.id).toLowerCase())) {
            visited.add(String(curr.id).toLowerCase());
            path.unshift(curr.name);
            curr = curr._normalizedParentId ? map.get(curr._normalizedParentId) : null;
        }

        return {
            ...item,
            orgHierarchy: path
        };
    });
}

// ۸. تابع دریافت داده از API و بروزرسانی گرید
async function refreshGrid() {
    const gridDiv = document.querySelector('#myGrid');
    if (!gridDiv) return;

    try {
        gridDiv.dataset.loading = "true";

        const queryInput = {
            filter: "",
            sorting: "DisplayOrder asc, Name asc",
            skipCount: 0,
            maxResultCount: 500 
        };

        // فراخوانی سرویس مخاطبین (ABP Proxy)
        const response = await lifeFlow.finance.contact.getList(queryInput);
        let rawItems = response?.items || (Array.isArray(response) ? response : []);

        // سورت اولیه بر اساس ترتیب نمایش
        rawItems.sort((a, b) => getDisplayOrder(a) - getDisplayOrder(b));

        const treeReadyData = mapTreeData(rawItems);
        gridApi.setGridOption("rowData", treeReadyData);

    } catch (error) {
        console.error("خطا در بارگذاری لیست مخاطبین:", error);
    } finally {
        gridDiv.dataset.loading = "false";
    }
}

// ۹. کانفیگ و راه‌اندازی AG Grid Enterprise
async function initTreeGrid() {
    const gridDiv = document.querySelector('#myGrid');
    if (!gridDiv) return;

    const gridOptions = {
        treeData: true,
        animateRows: true,
        enableRtl: true,
        getDataPath: (data) => data.orgHierarchy,
        groupDefaultExpanded: 1, // سطوح اصلی به صورت باز نمایش داده شوند

        // سورت درون‌شاخه‌ای بر اساس DisplayOrder و سپس Name
        postSortRows: (params) => {
            const rowNodes = params.nodes;
            rowNodes.sort((rowNodeA, rowNodeB) => {
                const orderA = getDisplayOrder(rowNodeA.data);
                const orderB = getDisplayOrder(rowNodeB.data);

                if (orderA !== orderB) {
                    return orderA - orderB;
                }
                return String(rowNodeA.data?.name || "").localeCompare(String(rowNodeB.data?.name || ""), 'fa');
            });
        },

        // ستون درختی اصلی (نام و گروه)
        autoGroupColumnDef: {
            headerName: "نام طرف‌حساب / گروه",
            minWidth: 320,
            flex: 2.2,
            cellRendererParams: {
                suppressCount: false,
                innerRenderer: (params) => {
                    if (!params.data) return params.value;

                    const isGroup = Boolean(params.data.isGroup);
                    const nick = params.data.legalOrNickName ? `<span class="text-muted ms-1" style="font-size:12px;">(${escapeHtml(params.data.legalOrNickName)})</span>` : '';

                    if (isGroup) {
                        return `
                            <span class="fw-bold text-primary">
                                <i class="bi bi-folder2-open text-warning me-1"></i>
                                ${escapeHtml(params.data.name)}
                                ${nick}
                            </span>
                        `;
                    }

                    return `
                        <span class="fw-normal">
                            <i class="bi bi-person text-secondary me-1"></i>
                            ${escapeHtml(params.data.name)}
                            ${nick}
                        </span>
                    `;
                }
            }
        },

        // سایر ستون‌های گرید
        columnDefs: [
            {
                headerName: "نوع",
                field: "contactType",
                width: 110,
                cellRenderer: (p) => renderContactTypeBadge(p.value)
            },
            {
                headerName: "نقش‌های مالی",
                width: 220,
                cellRenderer: (p) => renderRolesBadges(p.data)
            },
            {
                headerName: "برچسب‌ها (تگ‌ها)",
                field: "tags",
                minWidth: 220,
                flex: 1.5,
                cellRenderer: (p) => renderTagsBadges(p.value)
            },
            {
                headerName: "الگوهای تطبیق بانکی",
                field: "autoMatchPatterns",
                minWidth: 200,
                flex: 1.2,
                cellRenderer: (p) => {
                    if (!p.value) return `<span class="text-muted">—</span>`;
                    return `<span class="badge bg-light text-dark font-monospace" style="font-size:11px;" title="${escapeHtml(p.value)}">${escapeHtml(p.value)}</span>`;
                }
            },
            {
                headerName: "یادداشت / موبایل",
                field: "note",
                minWidth: 180,
                flex: 1,
                cellRenderer: (p) => {
                    const mobile = p.data?.mobileNumber ? `<span class="badge bg-light text-secondary me-1">${escapeHtml(p.data.mobileNumber)}</span>` : '';
                    const note = p.value ? `<span class="text-muted small">${escapeHtml(p.value)}</span>` : '';
                    return `<div>${mobile}${note}</div>`;
                }
            },
            {
                headerName: "عملیات",
                width: 120,
                pinned: "left",
                sortable: false,
                filter: false,
                cellRenderer: contactActionsRenderer
            }
        ],

        defaultColDef: {
            resizable: true,
            sortable: true,
            filter: true
        }
    };

    gridApi = agGrid.createGrid(gridDiv, gridOptions);
    await refreshGrid();
}

// اجرای اولیه هنگام لود صفحه
document.addEventListener("DOMContentLoaded", () => {
    initTreeGrid();
});
