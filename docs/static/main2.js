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

// ۱. تابع نگاشت و ساخت سلسله‌مراتب درختی
function mapTreeData(items) {
    const map = new Map();

    items.forEach(item => {
        const rawParent = item.parent_project_id ?? item.parentProjectId ?? item.parentId ?? item.parent_id;
        const isRoot = rawParent === "" || rawParent === null || rawParent === undefined || rawParent === 0 || rawParent === "0" || rawParent === "NULL";
        
        map.set(String(item.id), {
            ...item,
            _normalizedParentId: isRoot ? null : String(rawParent)
        });
    });

    return items.map(item => {
        const path = [];
        const visited = new Set();
        let curr = map.get(String(item.id));

        while (curr && !visited.has(String(curr.id))) {
            visited.add(String(curr.id));
            const label = curr.title || curr.name || `پروژه #${curr.id}`;
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
                return (Number(rowNodeA.data?.id) || 0) - (Number(rowNodeB.data?.id) || 0);
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
                        return `<span class="group-cell-label">${colorDot}<span class="badge-icon">📁</span> <strong>${params.data.id}-${params.value}</strong></span>`;
                    } else {
                        return `<span class="action-cell-label">${colorDot}<span class="badge-icon">🚀</span> ${params.data.id}-${params.value}</span>`;
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
                field: "priority", 
                headerName: "اولویت", 
                width: 120,
                valueGetter: (params) => params.data?.Priority ?? params.data?.priority,
                cellRenderer: (params) => renderPriorityBadge(params.value),
                sortable: true
            },
            { 
                field: "status", 
                headerName: "وضعیت", 
                width: 130,
                valueGetter: (params) => params.data?.Status ?? params.data?.status,
                cellRenderer: (params) => renderStatusBadge(params.value),
                sortable: true
            },
            { 
                field: "description", 
                headerName: "توضیحات", 
                flex: 1,
                valueGetter: (params) => params.data?.Description ?? params.data?.description ?? "—"
            },
            { 
                field: "due_date", 
                headerName: "تاریخ سررسید", 
                width: 130,
                valueGetter: (params) => params.data?.DueDate ?? params.data?.dueDate ?? params.data?.due_date ?? "—"
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
            action: "listProjects",
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
