// main.js
// متغیر سراسری برای دسترسی به API گرید
let gridApi = null; 
// ۱. تابع بهینه برای تولید مسیر سلسله‌مراتب (Path) برای پروژه‌ها
function mapTreeData(items) {
    const map = new Map();

    // نرمال‌سازی داده‌ها: هر مقداری غیر از مقدار معتبر (مانند "" یا null یا 0) به عنوان ریشه (null) در نظر گرفته می‌شود
    items.forEach(item => {
        const rawParent = item.ParentId;
        const isRoot = rawParent === "" || rawParent === null || rawParent === undefined || rawParent === 0 || rawParent === "0" || rawParent === "NULL";
        
        map.set(String(item.Id), {
            ...item,
            _normalizedParentId: isRoot ? null : String(rawParent)
        });
    });

    // ساخت آرایه سلسله‌مراتب (Path) با محافظت از حلقه‌ها (Cycle) و والدهای ناموجود (Orphan)
    return items.map(item => {
        const path = [];
        const visited = new Set();
        let curr = map.get(String(item.Id));

        while (curr && !visited.has(String(curr.id))) {
            visited.add(String(curr.Id));
            const label = curr.Name || `پروژه #${curr.Id}`;
            path.unshift(label);

            curr = curr._normalizedParentId ? map.get(curr._normalizedParentId) : null;
        }

        return {
            ...item,
            orgHierarchy: path
        };
    });
}
function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
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
            data-account-id="${escapeHtml(account.Id)}"
            title="افزودن زیرحساب">
            <i class="fas fa-plus"></i>
        </button>

        <button
            type="button" 
            class="btn btn-sm btn-light-warning js-account-edit"
            data-account-id="${escapeHtml(account.Id)}"
            title="ویرایش حساب">
            <i class="fas fa-edit"></i>
        </button>

        <button
            type="button"
            class="btn btn-sm btn-light-danger js-account-delete"
            data-account-id="${escapeHtml(account.Id)}"
            title="حذف حساب">
            <i class="fas fa-trash"></i>
        </button>
    `;

    return container;
}

// تابع مستقل برای دریافت مجدد داده‌ها و بروزرسانی گرید
async function refreshGrid() {
    if (!gridApi) return;

    const gridDiv = document.querySelector('#myGrid');
    try {
        if (gridDiv) gridDiv.dataset.loading = "true";

        // فراخوانی API
        const response = await window.ApiClient1.get({
            action: "listAccounts",
        });

        let rawItems = [];
        if (response && response.ok && Array.isArray(response.data)) {
            rawItems = response.data;
        } else if (Array.isArray(response)) {
            rawItems = response;
        }

        // تبدیل داده‌های مسطح به ساختار درختی AG Grid
        const treeReadyData = mapTreeData(rawItems);

        // ست کردن داده‌ها روی گرید
        gridApi.setGridOption("rowData", treeReadyData);

    } catch (error) {
        console.error("خطا در بارگذاری ساختار درختی پروژه‌ها:", error);
    } finally {
        if (gridDiv) gridDiv.dataset.loading = "false";
    }
}

async function initTreeGrid() {
    const gridDiv = document.querySelector('#myGrid');
    if (!gridDiv) return;

    // ۲. پیکربندی سازمانی AG Grid Enterprise
    const gridOptions = {
        // فعال‌سازی حالت درختی
        treeData: true,
        animateRows: true,
        enableRtl: true,

        // مسیر درختی را از فیلد orgHierarchy می‌خواند
        getDataPath: (data) => data.orgHierarchy,

        // 0 یعنی تمام ریشه‌ها پیش‌فرض بسته باشند (-1 یعنی همه باز باشند)
        groupDefaultExpanded: 0,

        // تنظیمات ستون اصلی درختی (Auto Group Column)
        autoGroupColumnDef: {
            headerName: "عنوان پروژه / وظیفه",
            minWidth: 320,
            flex: 2,
            cellRendererParams: {
                suppressCount: false // نمایش تعداد زیرمجموعه‌ها کنار نام پروژه
            }
        },

        // سایر ستون‌های جانبی جدول
        columnDefs: [
            { 
                field: "Id", 
                headerName: "شناسه", 
                width: 90,
                sortable: true 
            },
            { 
                field: "Description", 
                headerName: "توضیحات", 
                flex: 1,
                valueFormatter: params => params.value ? params.value : "—"
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

    // ۳. اینیت کردن گرید و اتصال به متغیر سراسری (حذف const)
    gridApi = agGrid.createGrid(gridDiv, gridOptions);

    // ۴. دریافت و لود اولیه داده‌ها
    await refreshGrid();
}

document.addEventListener('DOMContentLoaded',  () => {
    initTreeGrid();
    initButtons();
});
function initButtons() {
    document.getElementById('btnAddAccount')?.addEventListener('click', handleAddAccount);
    document.getElementById('btnAddChildAccount')?.addEventListener('click', handleAddChildAccount);
   
     const gridDiv = document.getElementById("myGrid");
      gridDiv?.addEventListener("click", function (event) {
        // ممکن است کلیک روی خود i داخل دکمه باشد
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
        url: window.appUrl('/financial/accounts/create.html'),
        onMessage: async function (data) {
            console.log('داده دریافتی از پاپ‌آپ:', data);

            if (data && data.type === 'ACCOUNT_SAVED') {
                // ۱. بستن مدال پاپ‌آپ
                closePopup(); // یا اگر شناسه خاصی دادید: closePopup('modal-id')

                // ۲. رفرش کردن جدول AG Grid
                await refreshGrid();
                
                // ۳. (اختیاری) نمایش پیام موفقیت با توست
                // toastr.success('حساب با موفقیت ذخیره شد');
            }
        }
    });
}
function handleAddChildAccount(button, event) {
     event.preventDefault();

    const accountId = button.dataset.accountId;
    openPopup({
        url: window.appUrl(`/financial/accounts/create.html?parent_id=${encodeURIComponent(accountId)}`),
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
        url: window.appUrl(`/financial/accounts/edit.html?id=${encodeURIComponent(accountId)}`),
        onMessage: async function (data) {
             closePopup();
                await refreshGrid();
            // if (data && data.type === 'ACCOUNT_SAVED') {
            //     closePopup();
            //     await refreshGrid();
            // }
        }
    });
}
