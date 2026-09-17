// weekly-tree.js


// تابع کمکی تفکیک رشته شمسی به تاریخ و زمان
// تابع کمکی تفکیک رشته شمسی به تاریخ و زمان (بدون ثانیه)
function parseShamsiDateTime(val) {
    if (!val) return { date: "—", time: "—" };
    
    const str = String(val).trim();
    const parts = str.split(/\s+/);
    
    let timeFormatted = "—";
    if (parts[1]) {
        // دریافت ۵ کاراکتر اول زمان (مثلاً 20:30 از 20:30:00)
        timeFormatted = parts[1].substring(0, 5);
    }

    return {
        date: parts[0] || "—",
        time: timeFormatted
    };
}


// ۱. تابع کمکی استخراج DisplayOrder با Fallback ایمن
function getDisplayOrder(data) {
    if (!data) return 999999;
    const order = data.DisplayOrder ?? data.displayOrder ?? data.display_order;
    const num = Number(order);
    return isNaN(num) ? 999999 : num;
}

// ۲. بررسی نوع گره (NodeType)
function getNodeType(data) {
    if (!data) return "TASK";
    return String(data.NodeType ?? data.nodeType ?? data.node_type ?? "TASK").toUpperCase();
}

function isGroupNode(data) {
    const type = getNodeType(data);
    return type === "FOLDER" || type === "PROJECT";
}

// ۳. تابع کمکی رندر بج نوع گره (NodeType)
function renderNodeTypeBadge(nodeType) {
    const type = String(nodeType || "TASK").toUpperCase();
    const map = {
        "FOLDER": { label: "دسته‌بندی", bg: "#f1f5f9", text: "#475569", icon: "📁" },
        "PROJECT": { label: "پروژه", bg: "#e0e7ff", text: "#3730a3", icon: "🚀" },
        "TASK": { label: "وظیفه", bg: "#ecfdf5", text: "#065f46", icon: "✅" },
        "ROUTINE": { label: "روتین", bg: "#fef3c7", text: "#92400e", icon: "🔄" }
    };

    const item = map[type] || { label: type, bg: "#f1f5f9", text: "#334155", icon: "•" };
    return `<span style="display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:9999px; font-size:11.5px; font-weight:600; background:${item.bg}; color:${item.text};">${item.icon} ${item.label}</span>`;
}

// ۴. تابع کمکی رندر بج اولویت (Priority)
function renderPriorityBadge(val) {
    if (val === null || val === undefined || val === "") return `<span style="color:#cbd5e1;">—</span>`;
    
    const p = String(val).toLowerCase().trim();
    const map = {
        "1": { label: "فوری", bg: "#fee2e2", text: "#991b1b", icon: "🔴" },
        "urgent": { label: "فوری", bg: "#fee2e2", text: "#991b1b", icon: "🔴" },
        "high": { label: "بالا", bg: "#ffedd5", text: "#9a3412", icon: "🟠" },
        "2": { label: "بالا", bg: "#ffedd5", text: "#9a3412", icon: "🟠" },
        "medium": { label: "متوسط", bg: "#fef9c3", text: "#854d0e", icon: "🟡" },
        "3": { label: "متوسط", bg: "#fef9c3", text: "#854d0e", icon: "🟡" },
        "low": { label: "پایین", bg: "#f1f5f9", text: "#475569", icon: "⚪" },
        "4": { label: "پایین", bg: "#f1f5f9", text: "#475569", icon: "⚪" }
    };

    const item = map[p] || { label: val, bg: "#f1f5f9", text: "#475569", icon: "•" };
    return `<span style="display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:9999px; font-size:11.5px; font-weight:500; background:${item.bg}; color:${item.text};">${item.icon} ${item.label}</span>`;
}

// ۵. تابع ساخت مسیر درختی (Hierarchy Path) بر اساس Id و ParentId خروجی سرور
function mapTreeData(items) {
    const map = new Map();

    items.forEach(item => {
        const rawId = String(item.Id ?? item.id);
        const rawParent = item.ParentId ?? item.parentId ?? item.parent_id;
        const isRoot = !rawParent || rawParent === "0" || rawParent === 0 || String(rawParent).toUpperCase() === "NULL";

        map.set(rawId, {
            ...item,
            _id: rawId,
            _normalizedParentId: isRoot ? null : String(rawParent)
        });
    });

    return items.map(item => {
        const path = [];
        const visited = new Set();
        let curr = map.get(String(item.Id ?? item.id));

        while (curr && !visited.has(curr._id)) {
            visited.add(curr._id);
            const label = curr.Title || curr.title || curr.TaskDescription || `آیتم #${curr._id}`;
            path.unshift(label);

            curr = curr._normalizedParentId ? map.get(curr._normalizedParentId) : null;
        }

        return {
            ...item,
            orgHierarchy: path
        };
    });
}

// ۶. راه‌اندازی و تنظیمات AG Grid
async function initWeeklyTreeGrid(targetWeekId = "") {
    const gridDiv = document.querySelector('#myGrid');
    if (!gridDiv) return;

    const gridOptions = {
        treeData: true,
        animateRows: true,
        enableRtl: true,
        getDataPath: (data) => data.orgHierarchy,
        groupDefaultExpanded: 1, // سطح اول باز باشد

        // مرتب‌سازی درونی سطوح بر اساس DisplayOrder
        postSortRows: (params) => {
            const rowNodes = params.nodes;
            rowNodes.sort((a, b) => {
                const orderA = getDisplayOrder(a.data);
                const orderB = getDisplayOrder(b.data);

                if (orderA !== orderB) return orderA - orderB;
                return (Number(a.data?.Id || a.data?.id || 0)) - (Number(b.data?.Id || b.data?.id || 0));
            });
        },

        // استایل‌دهی ردیف‌ها متناسب با نوع آیتم
        rowClassRules: {
            'grid-row-group': (params) => isGroupNode(params.data),
            'grid-row-task': (params) => getNodeType(params.data) === "TASK",
            'grid-row-routine': (params) => getNodeType(params.data) === "ROUTINE"
        },

        // ستون درختی اصلی (Tree Column)
        autoGroupColumnDef: {
            headerName: "ساختار برنامه / عنوان کار",
            minWidth: 350,
            flex: 2,
            cellRendererParams: {
                suppressCount: false,
                innerRenderer: (params) => {
                    if (!params.data) return params.value;
                    const type = getNodeType(params.data);
                    
                    let icon = "✅";
                    if (type === "FOLDER") icon = "📁";
                    else if (type === "PROJECT") icon = "🚀";
                    else if (type === "ROUTINE") icon = "🔄";

                    const isBold = isGroupNode(params.data);
                    const titleText = params.value || params.data.Title || "(بدون عنوان)";
                    
                    return `
                      <span style="display:inline-flex; align-items:center; gap:6px;">
                        <span>${icon}</span>
                        <span style="${isBold ? 'font-weight:700; color:#0f172a;' : 'color:#334155;'}">
                          ${titleText}
                        </span>
                      </span>
                    `;
                }
            }
        },

        // ستون‌های اطلاعاتی متناسب با دیتابیس
        columnDefs: [
            // ۱. ستون تاریخ شمسی
            {
                headerName: "تاریخ",
                width: 125,
                sortable: true,
                valueGetter: (params) => {
                    const raw = params.data?.DateShamsi ?? params.data?.dateShamsi;
                    return parseShamsiDateTime(raw).date;
                },
                cellRenderer: (params) => {
                    if (params.value === "—") return `<span style="color:#cbd5e1;">—</span>`;
                    return `<span style="font-family:inherit; direction:ltr; display:inline-block;">${params.value}</span>`;
                }
            },
            // ۲. ستون ساعت / زمان
            {
                headerName: "ساعت",
                width: 100,
                sortable: true,
                valueGetter: (params) => {
                    const raw = params.data?.DateShamsi ?? params.data?.dateShamsi;
                    return parseShamsiDateTime(raw).time;
                },
                cellRenderer: (params) => {
                    if (params.value === "—") return `<span style="color:#cbd5e1;">—</span>`;
                    return `<span style="font-family:inherit; direction:ltr; display:inline-block; color:#475569; font-weight:500;">${params.value}</span>`;
                }
            },
              {
              field: "DateShamsi", 
                headerName: "روز", 
                width: 160,
                sortable: true 
            },

            {
                headerName: "نوع رکورد",
                width: 130,
                valueGetter: (params) => getNodeType(params.data),
                cellRenderer: (params) => renderNodeTypeBadge(params.value),
                sortable: true
            },
            {
                headerName: "پروژه والد",
                width: 180,
                valueGetter: (params) => {
                    const desc = params.data?.ProjectDescription;
                    const id = params.data?.ProjectId;
                    return desc || (id ? `#${id}` : "—");
                },
                cellRenderer: (params) => {
                    if (params.value === "—") return `<span style="color:#cbd5e1;">—</span>`;
                    return `<span style="color:#475569; font-weight:500;">${params.value}</span>`;
                }
            },
            { 
                field: "Priority", 
                headerName: "اولویت", 
                width: 110,
                valueGetter: (params) => params.data?.Priority ?? params.data?.priority ?? "",
                cellRenderer: (params) => renderPriorityBadge(params.value),
                sortable: true
            },
            // {
            //     headerName: "عملیات / تایمر",
            //     width: 140,
            //     sortable: false,
            //     filter: false,
            //     cellRenderer: (params) => {
            //         if (!params.data) return "";
            //         const type = getNodeType(params.data);

            //         // فقط تسک‌ها و روتین‌ها تایمر دارند
            //         if (type === "TASK" || type === "ROUTINE") {
            //             const taskId = params.data.TaskId || "";
            //             const projectId = params.data.ProjectId || "";
            //             const title = encodeURIComponent(params.data.Title || "");

            //             return `
            //               <button 
            //                 type="button"
            //                 onclick="startLifeFlowTimer('${params.data.Id}', '${taskId}', '${projectId}', '${title}')"
            //                 style="background:#0ea5e9; color:#fff; border:none; border-radius:6px; padding:3px 10px; font-size:11px; cursor:pointer; display:inline-flex; align-items:center; gap:4px;">
            //                 ⏱️ ثبت زمان
            //               </button>
            //             `;
            //         }
            //         return `<span style="color:#cbd5e1;">—</span>`;
            //     }
            // }
        ],

        defaultColDef: {
            resizable: true,
            sortable: true,
            filter: true
        }
    };

    // ایجاد گرید
    const gridApi = agGrid.createGrid(gridDiv, gridOptions);

    try {
        gridDiv.dataset.loading = "true";

        // فراخوانی متد بازنویسی‌شده از بک‌اند GAS
        const response = await window.ApiClient1.get({
            action: "getDailyPlanWithDetails",
            sprintId: 'bbc2ed99-7a21-4a4a-91f5-477b4eaef406'
        });

        let rawItems = [];
        if (response && response.ok && Array.isArray(response.data)) {
            rawItems = response.data;
        } else if (Array.isArray(response)) {
            rawItems = response;
        }

        // مرتب‌سازی اولیه بر اساس DisplayOrder
        rawItems.sort((a, b) => getDisplayOrder(a) - getDisplayOrder(b));

        // نگاشت به ساختار درختی
        const treeReadyData = mapTreeData(rawItems);
        gridApi.setGridOption("rowData", treeReadyData);

    } catch (error) {
        console.error("خطا در بارگذاری برنامه هفتگی درختی:", error);
    } finally {
        gridDiv.dataset.loading = "false";
    }
}

// ۷. تابع اتصال سریع به افزونه کروم تایمر
window.startLifeFlowTimer = function(planId, taskId, projectId, encodedTitle) {
    const title = decodeURIComponent(encodedTitle);
    
    // ارسال پیام به افزونه کروم در صورت وجود Runtime
    if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({
            action: "START_TIMER",
            payload: {
                planId: planId,
                taskId: taskId,
                projectId: projectId,
                title: title
            }
        }, (response) => {
            console.log("پاسخ افزونه تایمر:", response);
        });
    } else {
        // Fallback: ذخیره در LocalStorage برای خواندن توسط Popup افزونه
        localStorage.setItem("lifeFlow_active_timer", JSON.stringify({
            planId,
            taskId,
            projectId,
            title,
            startTime: Date.now()
        }));
        alert(`تایمر برای «${title}» فعال شد.`);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // کد هفته هدف (یا ارسال رشته خالی برای دریافت تمام تسک‌ها)
    initWeeklyTreeGrid("1403-W25"); 
});
