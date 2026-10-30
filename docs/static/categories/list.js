// متغیر سراسری برای دسترسی به API گرید
let gridApi = null;

// تابع کمکی برای استخراج مقدار DisplayOrder
function getDisplayOrder(data) {
    if (!data) return 999999;
    const order = data.DisplayOrder ?? data.displayOrder ?? data.display_order;
    const num = Number(order);
    return isNaN(num) ? 999999 : num;
}

// تابع رندر نوع تراکنش (TransactionTypeEnum: 1=هزینه, 2=درآمد, 3=انتقال)
function renderTransactionTypeBadge(type) {
    const t = Number(type);
    switch (t) {
        case 1:
            return `<span class="badge" style="background:#fee2e2; color:#991b1b; font-weight:500; font-size:11px; padding:3px 8px; border-radius:6px;">هزینه</span>`;
        case 2:
            return `<span class="badge" style="background:#dcfce7; color:#166534; font-weight:500; font-size:11px; padding:3px 8px; border-radius:6px;">درآمد</span>`;
        case 3:
            return `<span class="badge" style="background:#e0f2fe; color:#0369a1; font-weight:500; font-size:11px; padding:3px 8px; border-radius:6px;">انتقال</span>`;
        default:
            return `<span style="color:#94a3b8;">—</span>`;
    }
}

// تابع فرار از کاراکترهای خاص HTML
function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// رندرر دکمه‌های عملیات برای هر ردیف دسته‌بندی
function categoryActionsRenderer(params) {
    const category = params.data;
    if (!category) return "";

    const isSystem = Boolean(category.isSystem ?? category.IsSystem);
    const container = document.createElement("div");
    container.className = "d-flex align-items-center gap-1";

    // دکمه افزودن زیردسته (همیشه فعال است)
    let buttonsHtml = `
        <button
            type="button"
            class="btn btn-sm btn-icon btn-light-primary js-category-add-child"
            data-category-id="${escapeHtml(category.id)}"
            data-category-title="${escapeHtml(category.title)}"
            data-transaction-type="${escapeHtml(category.transactionType)}"
            title="افزودن زیردسته">
            <i class="fas fa-plus"></i>
        </button>
    `;

    // دکمه ویرایش (دسته‌های سیستمی فقط ویرایش محدود دارند یا غیرفعال می‌شوند)
    buttonsHtml += `
        <button
            type="button" 
            class="btn btn-sm btn-icon btn-light-warning js-category-edit"
            data-category-id="${escapeHtml(category.id)}"
            title="ویرایش دسته‌بندی">
            <i class="fas fa-edit"></i>
        </button>
    `;

    // دکمه حذف (اگر سیستمی باشد غیرفعال می‌شود)
    if (isSystem) {
        buttonsHtml += `
            <button
                type="button"
                class="btn btn-sm btn-icon btn-light-secondary"
                disabled
                title="دسته‌بندی‌های سیستمی قابل حذف نیستند">
                <i class="fas fa-lock text-muted"></i>
            </button>
        `;
    } else {
        buttonsHtml += `
            <button
                type="button"
                class="btn btn-sm btn-icon btn-light-danger js-category-delete"
                data-category-id="${escapeHtml(category.id)}"
                title="حذف دسته‌بندی">
                <i class="fas fa-trash"></i>
            </button>
        `;
    }

    container.innerHTML = buttonsHtml;
    return container;
}

// ۱. تابع نگاشت و ساخت سلسله‌مراتب درختی (Path Builder)
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
            path.unshift(curr.title);
            curr = curr._normalizedParentId ? map.get(curr._normalizedParentId) : null;
        }

        return {
            ...item,
            orgHierarchy: path
        };
    });
}

// ۲. تابع دریافت مجدد داده‌ها و بروزرسانی گرید
async function refreshGrid() {
    const gridDiv = document.querySelector('#myGrid');
    if (!gridDiv) return;

    try {
        gridDiv.dataset.loading = "true";

        // کل درخت باید دریافت شود تا شکستگی در شاخه‌ها پیش نیاید
        const queryInput = {
            filterText: "",
            sorting: "DisplayOrder asc",
            skipCount: 0,
            maxResultCount: 500 
        };

        // فراخوانی سرویس کتگوری (ABP proxy)
        const response = await lifeFlow.finance.category.getList(queryInput);

        let rawItems = response?.items || (Array.isArray(response) ? response : []);

        // مرتب‌سازی اولیه داده‌ها
        rawItems.sort((a, b) => getDisplayOrder(a) - getDisplayOrder(b));

        const treeReadyData = mapTreeData(rawItems);
        gridApi.setGridOption("rowData", treeReadyData);

    } catch (error) {
        console.error("خطا در بارگذاری ساختار درختی دسته‌بندی‌ها:", error);
    } finally {
        gridDiv.dataset.loading = "false";
    }
}

// ۳. راه‌اندازی گرید AG Grid Enterprise
async function initTreeGrid() {
    const gridDiv = document.querySelector('#myGrid');
    if (!gridDiv) return;

    const gridOptions = {
        treeData: true,
        animateRows: true,
        enableRtl: true,
        getDataPath: (data) => data.orgHierarchy,
        groupDefaultExpanded: 1, // سطح اول باز باشد

        // مرتب‌سازی درون هر شاخه بر اساس DisplayOrder
        postSortRows: (params) => {
            const rowNodes = params.nodes;
            rowNodes.sort((rowNodeA, rowNodeB) => {
                const orderA = getDisplayOrder(rowNodeA.data);
                const orderB = getDisplayOrder(rowNodeB.data);

                if (orderA !== orderB) {
                    return orderA - orderB;
                }
                return String(rowNodeA.data?.title || "").localeCompare(String(rowNodeB.data?.title || ""), 'fa');
            });
        },

        // ستون اصلی درختی
        autoGroupColumnDef: {
            headerName: "عنوان دسته‌بندی",
            minWidth: 340,
            flex: 2,
            cellRendererParams: {
                suppressCount: false,
                innerRenderer: (params) => {
                    if (!params.data) return params.value;

                    const isGroup = Boolean(params.data.isGroup ?? params.data.IsGroup);
                    const color = params.data.colorHex ?? params.data.ColorHex;
                    const icon = params.data.icon ?? params.data.Icon;

                    // نقطه رنگی اختصاصی
                    const colorDot = color 
                        ? `<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:${color}; margin-left:6px; vertical-align:middle;"></span>` 
                        : "";

                    // نمایش آیکون واقعی Bootstrap Icons یا ایموجی پیش‌فرض
                    let iconHtml = "";
                    if (icon) {
                        iconHtml = `<i class="bi ${icon} me-1" style="${color ? `color:${color};` : ''}"></i> `;
                    } else {
                        iconHtml = isGroup ? `<i class="bi bi-folder2 text-warning me-1"></i> ` : `<i class="bi bi-tag text-secondary me-1"></i> `;
                    }

                    if (isGroup) {
                        return `<span class="group-cell-label">${colorDot}${iconHtml}<strong>${escapeHtml(params.value)}</strong></span>`;
                    } else {
                        return `<span class="action-cell-label">${colorDot}${iconHtml}${escapeHtml(params.value)}</span>`;
                    }
                }
            }
        },

        // سایر ستون‌ها
        columnDefs: [
            {
                field: "transactionType",
                headerName: "نوع",
                width: 100,
                cellRenderer: (params) => renderTransactionTypeBadge(params.value),
                sortable: true
            },
            {
                field: "displayOrder",
                headerName: "ترتیب",
                width: 80,
                valueGetter: (params) => getDisplayOrder(params.data) === 999999 ? "—" : getDisplayOrder(params.data),
                sortable: true
            },
            {
                field: "isSystem",
                headerName: "سیستمی",
                width: 90,
                cellRenderer: (params) => {
                    const isSys = Boolean(params.value);
                    return isSys 
                        ? `<span class="badge" style="background:#f1f5f9; color:#475569; font-size:10.5px;">سیستمی</span>` 
                        : `<span style="color:#94a3b8;">کاربر</span>`;
                }
            },
            { 
                field: "description", 
                headerName: "توضیحات", 
                flex: 1,
                valueGetter: (params) => params.data?.description ?? params.data?.Description ?? "—"
            },
            {
                headerName: "عملیات",
                width: 150,
                sortable: false,
                filter: false,
                resizable: false,
                cellRenderer: categoryActionsRenderer
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

// دکمه‌ها و ایونت لیسنرها
function initButtons() {
    document.getElementById('AddCategory')?.addEventListener('click', handleAddCategory);

    const gridDiv = document.getElementById("myGrid");
    gridDiv?.addEventListener("click", function (event) {
        const editButton = event.target.closest(".js-category-edit");
        if (editButton) {
            handleEditCategory(editButton, event);
            return;
        }

        const addChildButton = event.target.closest(".js-category-add-child");
        if (addChildButton) {
            handleAddChildCategory(addChildButton, event);
            return;
        }

        const deleteButton = event.target.closest(".js-category-delete");
        if (deleteButton) {
            handleDeleteCategory(deleteButton, event);
        }
    });
}

// هندلرهای مودال و پاپ‌آپ
async function handleAddCategory(event) {
    event.preventDefault();
    openPopup({
        url: window.appUrl('/categories/create.html'),
        onMessage: async function (data) {
            if (data && data.type === 'CATEGORY_SAVED') {
                closePopup();
                await refreshGrid();
            }
        }
    });
}

function handleAddChildCategory(button, event) {
    event.preventDefault();
    const categoryId = button.dataset.categoryId;
    const categoryTitle = button.dataset.categoryTitle || '';
    const transactionType = button.dataset.transactionType || 1;

    const query = new URLSearchParams({
        parentId: categoryId,
        parentTitle: categoryTitle,
        transactionType: transactionType
    }).toString();

    openPopup({
        url: window.appUrl(`/categories/create.html?${query}`),
        onMessage: async function (data) {
            if (data && data.type === 'CATEGORY_SAVED') {
                closePopup();
                await refreshGrid();
            }
        }
    });
}

function handleEditCategory(button, event) {
    event.preventDefault();
    const categoryId = button.dataset.categoryId;
    openPopup({
        url: window.appUrl(`/categories/edit.html?id=${encodeURIComponent(categoryId)}`),
        onMessage: async function (data) {
            if (data && data.type === 'CATEGORY_SAVED') {
                closePopup();
                await refreshGrid();
            }
        }
    });
}

async function handleDeleteCategory(button, event) {
    event.preventDefault();
    const categoryId = button.dataset.categoryId;
    if (!categoryId) return;

    if (confirm("آیا از حذف این دسته‌بندی اطمینان دارید؟")) {
        try {
            debugger;
            await lifeFlow.finance.category['delete'](categoryId);
            await refreshGrid();
        } catch (err) {
            console.error("خطا در حذف دسته‌بندی:", err);
            alert("امکان حذف این دسته‌بندی وجود ندارد (ممکن است دارای زیردسته یا تراکنش باشد).");
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initTreeGrid();
    initButtons();
});
