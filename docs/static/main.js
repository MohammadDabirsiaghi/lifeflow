// main.js

// ۱. تابع بهینه برای تولید مسیر سلسله‌مراتب (Path) برای هر رکورد
function mapTreeData(items) {
    const map = new Map();
    
    // نرمال‌سازی ParentId و Id در مپ
    items.forEach(item => {
        const isRoot = !item.ParentId || item.ParentId === "NULL" || item.ParentId === 0 || item.ParentId === "0";
        map.set(String(item.Id), {
            ...item,
            ParentId: isRoot ? null : String(item.ParentId)
        });
    });

    // ساخت آرایه سلسله‌مراتب (Path) برای هر گره
    return items.map(item => {
        const path = [];
        let curr = map.get(String(item.Id));
        
        while (curr) {
            // استفاده از عنوان فارسی برای نمایش در درخت
            const label = curr.TitleFa || curr.Title || curr.TitleEn || `ID: ${curr.Id}`;
            path.unshift(label);
            curr = curr.ParentId ? map.get(curr.ParentId) : null;
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
            headerName: "دسته‌بندی‌ها",
            minWidth: 320,
            flex: 2,
            cellRendererParams: {
                suppressCount: true, // نمایش ندادن تعداد زیرمجموعه‌ها کنار متن
                innerRenderer: (params) => {
                    const data = params.data;
                    if (!data) return params.value;

                    const img = (data.ImageUrl && data.ImageUrl !== "NULL")
                        ? `<img src="${data.ImageUrl}" style="width: 20px; height: 20px; object-fit: contain; margin-left: 8px; vertical-align: middle;" />`
                        : '';

                    return `<span>${img}${params.value}</span>`;
                }
            }
        },

        // سایر ستون‌های جانبی جدول
        columnDefs: [
            { 
                field: "Id", 
                headerName: "شناسه", 
                width: 100,
                sortable: true 
            },
            { 
                field: "TitleEn", 
                headerName: "English Title", 
                flex: 1 
            },
            {
                field: "CategoryLink",
                headerName: "لینک",
                width: 120,
                cellRenderer: params => {
                    if (!params.value || params.value === "NULL") return "-";
                    return `<a href="${params.value}" target="_blank" class="btn btn-sm btn-link p-0 text-decoration-none">مشاهده</a>`;
                }
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
            action: "listCategories",
        });

        let rawCategories = [];
        if (response && response.ok && Array.isArray(response.data)) {
            rawCategories = response.data;
        } else if (Array.isArray(response)) {
            rawCategories = response;
        }

        // ۵. تبدیل داده‌های مسطح به ساختار درختی AG Grid
        const treeReadyData = mapTreeData(rawCategories);

        // ۶. ست کردن داده‌ها روی گرید
        gridApi.setGridOption("rowData", treeReadyData);

    } catch (error) {
        console.error("خطا در بارگذاری ساختار درختی دسته‌بندی‌ها:", error);
    } finally {
        gridDiv.dataset.loading = "false";
    }
}

document.addEventListener('DOMContentLoaded', initTreeGrid);
