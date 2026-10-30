// متغیر سراسری برای دسترسی به API گرید
let gridApi = null; 

// تابع کمکی برای استخراج مقدار DisplayOrder با در نظر گرفتن سناریوهای مختلف نام‌گذاری
function getDisplayOrder(data) {
    if (!data) return 999999;
    const order = data.DisplayOrder ?? data.displayOrder ?? data.display_order;
    const num = Number(order);
    return isNaN(num) ? 999999 : num;
}

// تابع کمکی بررسی گروه بودن حساب
function isAccountGroup(data) {
    if (!data) return false;
    return Boolean(data.isGroup ?? data.IsGroup ?? false);
}

// تابع کمکی برای استخراج امن رنگ حساب (پشتیبانی از انواع نام‌گذاری‌ها)
function getAccountColor(data) {
    if (!data) return null;
    return data.Color ?? data.color ?? data.ColorHex ?? data.colorHex ?? null;
}

// تابع کمکی رندر بج اولویت (Priority)
function renderPriorityBadge(val) {
    if (val === null || val === undefined || val === "") return "—";
    
    const p = String(val).toLowerCase().trim();
    const map = {
        "1": { label: "فوری", bg: "#fee2e2", text: "#991b1b", icon: "🔴" },
        "urgent": { label: "فوری", bg: "#fee2e2", text: "#991b1b", icon: "🔴" },
        "2": { label: "بالا", bg: "#ffedd5", text: "#9a3412", icon: "🟠" },
        "high": { label: "بالا", bg: "#ffedd5", text: "#9a3412", icon: "🟠" },
        "3": { label: "متوسط", bg: "#fef9c3", text: "#854d0e", icon: "🟡" },
        "medium": { label: "متوسط", bg: "#fef9c3", text: "#854d0e", icon: "🟡" },
        "4": { label: "پایین", bg: "#f1f5f9", text: "#475569", icon: "⚪" },
        "low": { label: "پایین", bg: "#f1f5f9", text: "#475569", icon: "⚪" }
    };

    const item = map[p] || { label: val, bg: "#f1f5f9", text: "#475569", icon: "•" };
    return `<span style="display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:9999px; font-size:11.5px; font-weight:500; background:${item.bg}; color:${item.text};">${item.icon} ${item.label}</span>`;
}

// تابع کمکی رندر بج وضعیت (Status)
function renderStatusBadge(val) {
    if (val === null || val === undefined || val === "") return "—";
    
    const s = String(val).toLowerCase().trim();
    const map = {
        "completed": { label: "تکمیل شده", bg: "#dcfce7", text: "#166534" },
        "done": { label: "تکمیل شده", bg: "#dcfce7", text: "#166534" },
        "in_progress": { label: "در حال انجام", bg: "#dbeafe", text: "#1e40af" },
        "active": { label: "در جریان", bg: "#dbeafe", text: "#1e40af" },
        "waiting": { label: "در انتظار", bg: "#fef3c7", text: "#92400e" },
        "pending": { label: "معلق", bg: "#fef3c7", text: "#92400e" },
        "backlog": { label: "ایده / بعداً", bg: "#f3e8ff", text: "#6b21a8" }
    };

    const item = map[s] || { label: val, bg: "#f1f5f9", text: "#334155" };
    return `<span style="display:inline-flex; align-items:center; padding:2px 8px; border-radius:9999px; font-size:11.5px; font-weight:500; background:${item.bg}; color:${item.text};">${item.label}</span>`;
}

// رندرکننده حرفه‌ای ستون رنگ (ColorHex / Color)
function accountColorRenderer(params) {
    const color = getAccountColor(params.data);
    if (!color) return `<span style="color: #94a3b8; font-size: 12px;">—</span>`;

    return `
        <div style="display: flex; align-items: center; gap: 8px; height: 100%;">
            <span style="display: inline-block; width: 14px; height: 14px; border-radius: 4px; background-color: ${escapeHtml(color)}; border: 1px solid rgba(0,0,0,0.15); box-shadow: 0 1px 2px rgba(0,0,0,0.08);"></span>
            <span style="font-family: monospace; font-size: 12px; font-weight: 500; color: #334155; direction: ltr; text-align: left;">${escapeHtml(color)}</span>
        </div>
    `;
}

function accountActionsRenderer(params) {
    const account = params.data;
    if (!account) return "";

    const container = document.createElement("div");
    container.className = "d-flex align-items-center gap-1";

    container.innerHTML = `
        <button
            type="button"
            class="btn btn-sm btn-light-primary js-account-add-child"
            data-account-id="${escapeHtml(account.id ?? account.Id)}"
            data-account-title="${escapeHtml(account.title ?? account.Title)}"
            title="افزودن زیرحساب">
            <i class="fas fa-plus"></i>
        </button>

        <button
            type="button" 
            class="btn btn-sm btn-light-warning js-account-edit"
            data-account-id="${escapeHtml(account.id ?? account.Id)}"
            title="ویرایش حساب">
            <i class="fas fa-edit"></i>
        </button>

        <button
            type="button"
            class="btn btn-sm btn-light-danger js-account-delete"
            data-account-id="${escapeHtml(account.id ?? account.Id)}"
            title="حذف حساب">
            <i class="fas fa-trash"></i>
        </button>
    `;

    return container;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ۱. تابع نگاشت و ساخت سلسله‌مراتب درختی
function mapTreeData(items) {
    const map = new Map();

    items.forEach(item => {
        const itemId = item.id ?? item.Id;
        const rawParent = item.parentId ?? item.ParentId;
        const isRoot = rawParent === "" || rawParent === null || rawParent === undefined || rawParent === 0 || rawParent === "0" || rawParent === "NULL";
        
        map.set(String(itemId), {
            ...item,
            _normalizedParentId: isRoot ? null : String(rawParent)
        });
    });

    return items.map(item => {
        const path = [];
        const visited = new Set();
        let curr = map.get(String(item.id ?? item.Id));

        while (curr && !visited.has(String(curr.id ?? curr.Id))) {
            visited.add(String(curr.id ?? curr.Id));
            const label = curr.title ?? curr.Title;
            path.unshift(label);

            curr = curr._normalizedParentId ? map.get(curr._normalizedParentId) : null;
        }

        return {
            ...item,
            orgHierarchy: path
        };
    });
}

// تابع مستقل برای دریافت مجدد داده‌ها و بروزرسانی گرید
async function refreshGrid() {
    const gridDiv = document.querySelector('#myGrid');
    try {
        gridDiv.dataset.loading = "true";
        const queryInput = {
            filterText: "",    
            sorting: "",       
            skipCount: 0,      
            maxResultCount: 100 
        };
        const response = await lifeFlow.finance.account.getList(queryInput);

        let rawItems = response?.items || (Array.isArray(response) ? response : []);
        rawItems.sort((a, b) => getDisplayOrder(a) - getDisplayOrder(b));

        const treeReadyData = mapTreeData(rawItems);
        gridApi.setGridOption("rowData", treeReadyData);

    } catch (error) {
        console.error("خطا در بارگذاری ساختار درختی حساب‌ها:", error);
    } finally {
        gridDiv.dataset.loading = "false";
    }
}

async function initTreeGrid() {
    const gridDiv = document.querySelector('#myGrid');
    if (!gridDiv) return;

    // ۲. پیکربندی AG Grid Enterprise
    const gridOptions = {
        treeData: true,
        animateRows: true,
        enableRtl: true,
        getDataPath: (data) => data.orgHierarchy,
        groupDefaultExpanded: 1,

        // مرتب‌سازی اختصاصی درون هر سطح بر اساس DisplayOrder
        postSortRows: (params) => {
            const rowNodes = params.nodes;
            rowNodes.sort((rowNodeA, rowNodeB) => {
                const orderA = getDisplayOrder(rowNodeA.data);
                const orderB = getDisplayOrder(rowNodeB.data);

                if (orderA !== orderB) {
                    return orderA - orderB;
                }
                return (Number(rowNodeA.data?.id ?? rowNodeA.data?.Id) || 0) - (Number(rowNodeB.data?.id ?? rowNodeB.data?.Id) || 0);
            });
        },

        // ستون اصلی درختی با تفکیک آیکون گروه/غیرگروه و نقطه رنگی مدرن
        autoGroupColumnDef: {
            headerName: "عنوان حساب / ساختار",
            minWidth: 320,
            flex: 2,
            cellRendererParams: {
                suppressCount: false,
                innerRenderer: (params) => {
                    if (!params.data) return params.value;
                    
                    const isGroup = isAccountGroup(params.data);
                    const color = getAccountColor(params.data);
                    const colorDot = color ? `<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:${escapeHtml(color)}; margin-left:6px; box-shadow:0 1px 2px rgba(0,0,0,0.15); vertical-align:middle;" title="کد رنگ: ${escapeHtml(color)}"></span>` : "";
                    
                    if (isGroup) {
                        return `<span class="group-cell-label">${colorDot}<span class="badge-icon">📁</span> <strong>${params.value}</strong></span>`;
                    } else {
                        return `<span class="action-cell-label">${colorDot}<span class="badge-icon">💳</span> ${params.value}</span>`;
                    }
                }
            }
        },

        columnDefs: [
            {
                headerName: "رنگ شاخص",
                width: 120,
                field: "Color",
                sortable: true,
                filter: false,
                cellRenderer: accountColorRenderer
            },
            { 
                field: "description", 
                headerName: "توضیحات", 
                flex: 1,
                valueGetter: (params) => params.data?.Description ?? params.data?.description ?? "—"
            },
            {
                headerName: "عملیات",
                width: 190,
                sortable: false,
                filter: false,
                resizable: false,
                cellRenderer: accountActionsRenderer
            }
        ],

        defaultColDef: {
            resizable: true,
            sortable: true,
            filter: true
        }
    };

    // ۳. راه‌اندازی گرید
    gridApi = agGrid.createGrid(gridDiv, gridOptions);
    // ۴. دریافت و لود اولیه داده‌ها
    await refreshGrid();
}

// ارسال نتیجه به والد (پنجره اصلی)
function sendSelection(id, title) {
    const notifyPayload = {
        type: "ENTITY_PICKED",
        data: { id: id, title: title }
    };

    if (window.parent && window.parent !== window) {
        window.parent.postMessage(notifyPayload, "*");
    }

    if (window.opener && !window.opener.closed) {
        window.opener.postMessage(notifyPayload, "*");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initTreeGrid();
    initButtons();
});

function initButtons() {
    document.getElementById('AddAccount')?.addEventListener('click', handleAddAccount);
    document.getElementById('btnAddChildAccount')?.addEventListener('click', handleAddChildAccount);
   
    const gridDiv = document.getElementById("myGrid");
    gridDiv?.addEventListener("click", function (event) {
        const editButton = event.target.closest(".js-account-edit");
        if (editButton) {
            handleEditAccount(editButton, event);
            return;
        }

        const addChildButton = event.target.closest(".js-account-add-child");
        if (addChildButton) {
            handleAddChildAccount(addChildButton, event);
            return;
        }

        const deleteButton = event.target.closest(".js-account-delete");
        if (deleteButton) {
            handleDeleteAccount(deleteButton, event);
        }
    });
}

async function handleAddAccount(event) {
    event.preventDefault();
    openPopup({
        url: window.appUrl('/accounts/create.html'),
        onMessage: async function (data) {
            if (data && data.type === 'ACCOUNT_SAVED') {
                closePopup();
                await refreshGrid();
            }
        }
    });
}

function handleAddChildAccount(button, event) {
    event.preventDefault();
    const accountId = button.dataset.accountId;
    const accountTitle = button.dataset.accountTitle || '';

    const query = new URLSearchParams({
        parentId: accountId,
        parentIdTitle: accountTitle
    }).toString();

    openPopup({
        url: window.appUrl(`/accounts/create.html?${query}`),
        onMessage: async function (data) {
            if (data && data.type === 'ACCOUNT_SAVED') {
                closePopup();
                await refreshGrid();
            }
        }
    });
}

function handleEditAccount(button, event) {
    event.preventDefault();
    const accountId = button.dataset.accountId;
    openPopup({
        url: window.appUrl(`/accounts/edit.html?id=${encodeURIComponent(accountId)}`),
        onMessage: async function (data) {
            closePopup();
            await refreshGrid();
        }
    });
}
