let gridApi = null;

// ۱. تعیین مسیر درختی دو سطحی: [TypeTitle, Title]
function getAreaHierarchyPath(data) {
    if (!data) return ["سایر حوزه‌ها", "بدون عنوان"];

    // ۱. استخراج عنوان نوع (سطح ۱)
    const typeTitle = String(
        data.TypeTitle || 
        (data.Type ? `دسته ${data.Type}` : "")
    ).trim() || "سایر حوزه‌ها / عمومی";

    // ۲. استخراج عنوان حوزه (سطح ۲)
    const areaTitle = String(data.Title || "حوزه بدون عنوان").trim();

    return [typeTitle, areaTitle];
}

// ۲. رندر ستون عملیات (ویرایش و حذف) فقط برای رکوردهای سطح ۲ (Area واقعی)
function areaActionsRenderer(params) {
    const area = params.data;

    // اگر سطر یک پوشه/گروه باشد یا شناسه نداشته باشد، دکمه نمایش داده نمی‌شود
    if (!area || !area.Id || params.node.group) {
        return "";
    }

    const container = document.createElement("div");
    container.className = "d-flex align-items-center gap-1 justify-content-center";
    container.innerHTML = `
        <button
            type="button" 
            class="btn btn-sm btn-icon btn-light-warning js-area-edit"
            data-area-id="${escapeHtml(area.Id)}"
            title="ویرایش حوزه">
            <i class="fas fa-edit"></i>
        </button>
        <button
            type="button"
            class="btn btn-sm btn-icon btn-light-danger js-area-delete"
            data-area-id="${escapeHtml(area.Id)}"
            title="حذف حوزه">
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

// ۳. رفرش داده‌ها از سرور
async function refreshGrid() {
    const gridDiv = document.querySelector('#tasksGrid');
    try {
        if (gridDiv) gridDiv.dataset.loading = "true";

        const response = await window.ApiClient1.get({
            action: "getAreaList"
        });

        const items = (response && response.ok && Array.isArray(response.data))
            ? response.data
            : (Array.isArray(response) ? response : (response?.data || []));

        if (gridApi) {
            gridApi.setGridOption("rowData", items);
        }
    } catch (error) {
        console.error("خطا در بارگذاری حوزه‌ها:", error);
    } finally {
        if (gridDiv) gridDiv.dataset.loading = "false";
    }
}

// ۴. راه‌اندازی AG Grid به صورت Tree Data
async function initTasksGrid() {
    const gridDiv = document.querySelector('#tasksGrid');
    if (!gridDiv) return;

    const gridOptions = {
        animateRows: true,
        enableRtl: true,
        pagination: false,
        rowHeight: 44,

        // فعال‌سازی Tree Data
        treeData: true,
        getDataPath: (data) => getAreaHierarchyPath(data),

        // گروه پیش‌فرض به صورت باز (Expand شده)
        groupDefaultExpanded: 1,

        // ستون اول ساختار درختی (نوع و حوزه)
        autoGroupColumnDef: {
            headerName: "دسته‌بندی و عنوان حوزه",
            minWidth: 320,
            flex: 2,
            cellRendererParams: {
                suppressCount: false, // نمایش تعداد Areaهای زیرمجموعه جلوی Type
                innerRenderer: (params) => {
                    const isGroup = params.node.group;
                    if (isGroup) {
                        return `<span class="fw-bold text-dark"><i class="fas fa-folder-open text-warning me-1"></i> ${escapeHtml(params.value)}</span>`;
                    }
                    return `<span class="text-gray-800 ps-2"><i class="fas fa-layer-group text-primary me-1"></i> ${escapeHtml(params.value)}</span>`;
                }
            }
        },

        columnDefs: [
            {
                field: "Goal",
                headerName: "هدف حوزه",
                flex: 1.5,
                minWidth: 200,
                valueGetter: (params) => params.data?.Goal || "—"
            },
            {
                field: "Description",
                headerName: "توضیحات و استاندارد",
                flex: 2,
                minWidth: 280,
                valueGetter: (params) => params.data?.Description || params.data?.standard || "—"
            },
            {
                field: "ReviewRecurrenceType",
                headerName: "دوره مرور",
                width: 130,
                cellRenderer: (params) => {
                    const val = params.data?.ReviewRecurrenceType;
                    if (!val || val === "none") return `<span class="badge badge-light">بدون دوره</span>`;
                    const map = {
                        weekly: "هفتگی",
                        monthly: "ماهانه",
                        quarterly: "سه ماهه",
                        yearly: "سالانه"
                    };
                    return `<span class="badge badge-light-primary">${map[val] || val}</span>`;
                }
            },
            {
                headerName: "عملیات",
                width: 100,
                pinned: "left",
                sortable: false,
                filter: false,
                cellRenderer: areaActionsRenderer
            }
        ],

        defaultColDef: {
            resizable: true,
            sortable: true,
            filter: true,
            floatingFilter: false
        }
    };

    gridApi = agGrid.createGrid(gridDiv, gridOptions);
    await refreshGrid();
}

// ۵. مدیریت کلیک دکمه‌ها و پاپ‌آپ
function initButtons() {
    document.getElementById('AddArea')?.addEventListener('click', handleAddArea);

    const gridDiv = document.getElementById("tasksGrid");
    gridDiv?.addEventListener("click", function (event) {
        const editButton = event.target.closest(".js-area-edit");
        if (editButton) {
            handleEditArea(editButton, event);
            return;
        }

        const deleteButton = event.target.closest(".js-area-delete");
        if (deleteButton) {
            handleDeleteArea(deleteButton, event);
        }
    });
}

async function handleAddArea(event) {
    if (event) event.preventDefault();

    openPopup({
        url: window.appUrl('/areas/create.html'),
        onMessage: async function (data) {
            if (data && data.type === 'AREA_SAVED') {
                closePopup();
                await refreshGrid();
                if (typeof displayNotification === "function") {
                    displayNotification('حوزه جدید با موفقیت ذخیره شد', 'success');
                }
            }
        }
    });
}

function handleEditArea(button, event) {
    if (event) event.preventDefault();
    const areaId = button.dataset.areaId;
    if (!areaId) return;

    openPopup({
        url: window.appUrl(`/areas/create.html?id=${encodeURIComponent(areaId)}`),
        onMessage: async function (data) {
            if (data && data.type === 'AREA_SAVED') {
                closePopup();
                await refreshGrid();
                if (typeof displayNotification === "function") {
                    displayNotification('تغییرات با موفقیت ذخیره شد', 'success');
                }
            }
        }
    });
}

async function handleDeleteArea(button, event) {
    if (event) event.preventDefault();
    const areaId = button.dataset.areaId;
    if (!areaId) return;

    if (!confirm("آیا از حذف این حوزه اطمینان دارید؟")) return;

    try {
        const res = await window.ApiClient1.post("deleteArea", { id: areaId });
        if (res && res.ok !== false) {
            await refreshGrid();
            if (typeof displayNotification === "function") {
                displayNotification("حوزه با موفقیت حذف شد", "success");
            }
        }
    } catch (err) {
        console.error("خطا در حذف حوزه:", err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initTasksGrid();
    initButtons();
});
