// main.js

// تابع کمکی برای استخراج مقدار DisplayOrder با در نظر گرفتن سناریوهای مختلف نام‌گذاری
function getDisplayOrder(data) {
    if (!data) return 999999;
    const order = data.DisplayOrder ?? data.displayOrder ?? data.display_order;
    const num = Number(order);
    return isNaN(num) ? 999999 : num;
}

// تابع کمکی برای تشخیص سرگروه بودن
function isProjectGroup(data) {
    if (!data) return false;
    const type = data.Type ?? data.type;
    return type === 2 || type === "2" || type === null || type === undefined || type === "";
}




// ۱. تابع نگاشت و ساخت سلسله‌مراتب درختی
function mapTreeData(items) {
    const map = new Map();

    items.forEach(item => {
        const rawParent =item.ParentId ?? item.parentId ?? item.parent_id;
        const isRoot = rawParent === "" || rawParent === null || rawParent === undefined || rawParent === 0 || rawParent === "0" || rawParent === "NULL";
        
        map.set(String(item.Id), {
            ...item,
            _normalizedParentId: isRoot ? null : String(rawParent)
        });
    });

    return items.map(item => {
        const path = [];
        const visited = new Set();
        let curr = map.get(String(item.Id));

        while (curr && !visited.has(String(curr.Id))) {
            visited.add(String(curr.Id));
            const label = curr.Title || curr.name || `پروژه #${curr.Id}`;
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

    // ۲. پیکربندی AG Grid Enterprise
    const gridOptions = {
        treeData: true,
        animateRows: true,
        enableRtl: true,
        getDataPath: (data) => data.orgHierarchy,
        groupDefaultExpanded: 0,

        // مرتب‌سازی اختصاصی درون هر سطح بر اساس DisplayOrder
        postSortRows: (params) => {
            const rowNodes = params.nodes;
            rowNodes.sort((rowNodeA, rowNodeB) => {
                const orderA = getDisplayOrder(rowNodeA.data);
                const orderB = getDisplayOrder(rowNodeB.data);

                // ابتدا بر اساس DisplayOrder کوچک به بزرگ
                if (orderA !== orderB) {
                    return orderA - orderB;
                }
                // اگر برابر بودند بر اساس شناسه
                return (Number(rowNodeA.data?.Id) || 0) - (Number(rowNodeB.data?.Id) || 0);
            });
        },

        // اعمال کلاس‌های CSS برای تمایز کل ردیف
        rowClassRules: {
            'grid-row-group': (params) => isProjectGroup(params.data),
            'grid-row-actionable': (params) => !isProjectGroup(params.data)
        },

        // ستون اصلی درختی (با آیکون تفکیک‌شده و نشانگر رنگ در صورت وجود)
        autoGroupColumnDef: {
            headerName: "عنوان پروژه / وظیفه",
            minWidth: 320,
            flex: 2,
            cellRendererParams: {
                suppressCount: false,
                innerRenderer: (params) => {
                    if (!params.data) return params.value;
                    const isGroup = isProjectGroup(params.data);
                    const color = params.data?.Color ?? params.data?.color;
                    const colorDot = color ? `<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:${color}; margin-left:6px;"></span>` : "";
                    
                    if (isGroup) {
                        return `<span class="group-cell-label">${colorDot}<span class="badge-icon">📁</span> <strong>${params.data.Id}-${params.value}</strong></span>`;
                    } else {
                        return `<span class="action-cell-label">${colorDot}<span class="badge-icon">🚀</span> ${params.data.Id}-${params.value}</span>`;
                    }
                }
            }
        },

        // سایر ستون‌ها
        columnDefs: [
            // { 
            //     field: "id", 
            //     headerName: "شناسه", 
            //     width: 80,
            //     sortable: true 
            // },
            // {
            //     // ستون دایره رنگ شاخص
            //     headerName: "رنگ",
            //     width: 70,
            //     sortable: false,
            //     cellRenderer: (params) => {
            //         const color = params.data?.Color ?? params.data?.color;
            //         if (!color) return `<span style="color:#cbd5e1;">—</span>`;
            //         return `<div style="display:flex; align-items:center; justify-content:center; height:100%;">
            //                     <span title="${color}" style="display:inline-block; width:16px; height:16px; border-radius:50%; background-color:${color}; border:1px solid rgba(0,0,0,0.15); box-shadow:0 1px 2px rgba(0,0,0,0.05);"></span>
            //                 </div>`;
            //     }
            // },
            // {
            //     // ستون ترتیب نمایش
            //     field: "DisplayOrder",
            //     headerName: "ترتیب",
            //     width: 85,
            //     valueGetter: (params) => getDisplayOrder(params.data) === 999999 ? "—" : getDisplayOrder(params.data),
            //     sortable: true
            // },
            {
                headerName: "نوع",
                width: 130,
                valueGetter: (params) => isProjectGroup(params.data) ? "سرگروه" : "پروژه اجرایی",
                cellRenderer: (params) => {
                    const isGroup = isProjectGroup(params.data);
                    const badgeClass = isGroup ? "type-badge-group" : "type-badge-exec";
                    const label = isGroup ? "📁 سرگروه" : "⚡ اجرایی";
                    return `<span class="type-badge ${badgeClass}">${label}</span>`;
                }
            },
           
            { 
                field: "description", 
                headerName: "توضیحات", 
                flex: 1,
                valueGetter: (params) => params.data?.Description ?? params.data?.description ?? "—"
            }
        ],

        defaultColDef: {
            resizable: true,
            sortable: true,
            filter: true
        }
    };

    // ۳. راه‌اندازی گرید
    const gridApi = agGrid.createGrid(gridDiv, gridOptions);

    try {
        gridDiv.dataset.loading = "true";

        const response = await window.ApiClient1.get({
            action: "listTerminals",
        });

        let rawItems = [];
        if (response && response.ok && Array.isArray(response.data)) {
            rawItems = response.data;
        } else if (Array.isArray(response)) {
            rawItems = response;
        }

        // مرتب‌سازی اولیه داده‌های خام قبل از تبدیل درختی
        rawItems.sort((a, b) => getDisplayOrder(a) - getDisplayOrder(b));

        const treeReadyData = mapTreeData(rawItems);
        gridApi.setGridOption("rowData", treeReadyData);

    } catch (error) {
        console.error("خطا در بارگذاری ساختار درختی پروژه‌ها:", error);
    } finally {
        gridDiv.dataset.loading = "false";
    }
}

document.addEventListener('DOMContentLoaded', initTreeGrid);
