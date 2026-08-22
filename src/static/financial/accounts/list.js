// main.js

// ۱. تابع بهینه برای تولید مسیر سلسله‌مراتب (Path) برای پروژه‌ها
function mapTreeData(items) {
    const map = new Map();

    // نرمال‌سازی داده‌ها: هر مقداری غیر از مقدار معتبر (مانند "" یا null یا 0) به عنوان ریشه (null) در نظر گرفته می‌شود
    items.forEach(item => {
        const rawParent = item.parent_id;
        const isRoot = rawParent === "" || rawParent === null || rawParent === undefined || rawParent === 0 || rawParent === "0" || rawParent === "NULL";
        
        map.set(String(item.id), {
            ...item,
            _normalizedParentId: isRoot ? null : String(rawParent)
        });
    });

    // ساخت آرایه سلسله‌مراتب (Path) با محافظت از حلقه‌ها (Cycle) و والدهای ناموجود (Orphan)
    return items.map(item => {
        const path = [];
        const visited = new Set();
        let curr = map.get(String(item.id));

        while (curr && !visited.has(String(curr.id))) {
            visited.add(String(curr.id));
            const label = curr.title || `پروژه #${curr.id}`;
            path.unshift(label);

            curr = curr._normalizedParentId ? map.get(curr._normalizedParentId) : null;
        }

        return {
            ...item,
            orgHierarchy: path
        };
    });
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
                field: "id", 
                headerName: "شناسه", 
                width: 90,
                sortable: true 
            },
            { 
                field: "description", 
                headerName: "توضیحات", 
                flex: 1,
                valueFormatter: params => params.value ? params.value : "—"
            }
           
        ],

        defaultColDef: {
            resizable: true,
            sortable: true,
            filter: true
        }
    };

    // ۳. اینیت کردن گرید
    const gridApi = agGrid.createGrid(gridDiv, gridOptions);

    try {
        gridDiv.dataset.loading = "true";

        // ۴. فراخوانی API
        const response = await window.ApiClient.get({
            action: "listAccounts",
        });

        let rawItems = [];
        if (response && response.ok && Array.isArray(response.data)) {
            rawItems = response.data;
        } else if (Array.isArray(response)) {
            rawItems = response;
        }

        // ۵. تبدیل داده‌های مسطح به ساختار درختی AG Grid
        const treeReadyData = mapTreeData(rawItems);

        // ۶. ست کردن داده‌ها روی گرید
        gridApi.setGridOption("rowData", treeReadyData);

    } catch (error) {
        console.error("خطا در بارگذاری ساختار درختی پروژه‌ها:", error);
    } finally {
        gridDiv.dataset.loading = "false";
    }
}

document.addEventListener('DOMContentLoaded',  () => {
    initTreeGrid();
    initButtons();
});
function initButtons() {
     document.getElementById('btnAdd')?.addEventListener('click', handleAddCheckoutAttributeValue);
}
function handleAddCheckoutAttributeValue(btn, e) {
    debugger;
    console.log(btn);
    // console.log(e);
    //  e.preventDefault();


    openPopup('/financial/accounts/create.html');
     return true;
}