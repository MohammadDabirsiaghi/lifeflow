let gridApi = null; 

// نگه‌دارنده داده‌های کانتکست جهت جستجو و رندر سریع (O(1))
const contextsMap = new Map();

// تابع کمکی برای تبدیل رنگ Hex به RGBA جهت ساخت رنگ پس‌زمینه ملایم
function hexToRgba(hex, alpha = 0.12) {
    if (!hex || typeof hex !== "string" || !hex.startsWith("#")) {
        return "rgba(100, 116, 139, 0.12)";
    }
    const cleanHex = hex.replace("#", "");
    const fullHex = cleanHex.length === 3 
        ? cleanHex.split("").map(c => c + c).join("") 
        : cleanHex;
        
    const num = parseInt(fullHex, 16);
    if (isNaN(num)) return "rgba(100, 116, 139, 0.12)";
    
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// تابع بارگذاری و کش کردن کانتکست‌ها از شیت / API
async function loadContextsLookup() {
    try {
        const response = await window.ApiClient1.get({
            action: "listContexts"
        });

        const items = (response && response.ok && Array.isArray(response.data))
            ? response.data
            : (Array.isArray(response) ? response : []);

        contextsMap.clear();

        // فیلتر رکوردهای فعال و مرتب‌سازی بر اساس sort_order
        const activeItems = items.filter(item => {
            const active = item.is_active ?? item.isActive ?? true;
            return active === true || active === "TRUE" || active === 1 || active === "1";
        });

        activeItems.sort((a, b) => {
            const orderA = Number(a.sort_order ?? a.sortOrder ?? 9999);
            const orderB = Number(b.sort_order ?? b.sortOrder ?? 9999);
            return orderA - orderB;
        });

        activeItems.forEach(ctx => {
            const id = String(ctx.id ?? ctx.Id ?? "");
            const key = String(ctx.key ?? ctx.Key ?? "").toLowerCase().trim();
            const color = ctx.color ?? ctx.Color ?? "#475569";
            
            const meta = {
                id: id,
                key: key,
                titleFa: ctx.title_fa ?? ctx.titleFa ?? ctx.title ?? key,
                descFa: ctx.description_fa ?? ctx.descriptionFa ?? "",
                icon: ctx.icon ?? ctx.Icon ?? "🏷️",
                color: color,
                bgColor: hexToRgba(color, 0.12),
                sortOrder: Number(ctx.sort_order ?? ctx.sortOrder ?? 0)
            };

            if (id) contextsMap.set(id, meta);
            if (key) contextsMap.set(key, meta);
        });
    } catch (err) {
        console.warn("خطا در بارگذاری جدول Contexts:", err);
    }
}

// ۱. توابع کمکی برای رندر بج‌های اولویت، وضعیت و کانتکست
function renderContextBadge(val) {
    if (val === null || val === undefined || val === "") return `<span style="color:#94a3b8;">—</span>`;

    const lookupKey = String(val).toLowerCase().trim();
    const meta = contextsMap.get(lookupKey);

    if (!meta) {
        return `<span class="badge" style="background:#f1f5f9; color:#475569;">🏷️ ${val}</span>`;
    }

    return `
        <span class="badge" 
              title="${meta.descFa || meta.titleFa}"
              style="background-color: ${meta.bgColor}; color: ${meta.color}; border: 1px solid ${meta.color}33;">
            <span style="font-size: 13px; margin-left: 4px;">${meta.icon}</span>
            <span>${meta.titleFa}</span>
        </span>
    `;
}

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
    return `<span class="badge" style="background:${item.bg}; color:${item.text};">${item.icon} ${item.label}</span>`;
}

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
    return `<span class="badge" style="background:${item.bg}; color:${item.text};">${item.label}</span>`;
}

// تابع تشخیص انجام شدن تسک (جهت خط زدن عنوان تسک)
function isTaskCompleted(data) {
    if (!data) return false;
    const status = String(data.Status ?? data.status ?? "").toLowerCase().trim();
    return status === "completed" || status === "done" || status === "3";
}
function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
function taskActionsRenderer(params) {
    const task = params.data;

    if (!task) return "";

    const container = document.createElement("div");

    container.className = "d-flex align-items-center gap-1";

    container.innerHTML = `
       

        <button
            type="button" 
            class="btn btn-sm btn-light-warning js-task-edit"
            data-task-id="${escapeHtml(task.Id)}"
            title="ویرایش کار">
            <i class="fas fa-edit"></i>
        </button>

        <button
            type="button"
            class="btn btn-sm btn-light-danger js-task-delete"
            data-task-id="${escapeHtml(task.Id)}"
            title="حذف کار">
            <i class="fas fa-trash"></i>
        </button>
    `;

    return container;
}
async function refreshGrid() {
        const gridDiv = document.querySelector('#tasksGrid');
       try {
        gridDiv.dataset.loading = "true";

        // دریافت موازی و هم‌زمان تسک‌ها و کانتکست‌ها
        // const [_, tasksResponse] = await Promise.all([
        //     loadContextsLookup(),
        //     window.ApiClient1.get({ action: "listTasks" })
        // ]);
 // فراخوانی API
        const response = await window.ApiClient1.get({
            action: "getTaskList",
        });

      
      
        gridApi.setGridOption("rowData", Array.isArray(response) ? response : []);
    } catch (error) {
        console.error("خطا در بارگذاری تسک‌ها:", error);
    } finally {
        gridDiv.dataset.loading = "false";
    }
}
// ۲. راه‌اندازی گرید تسک‌ها
async function initTasksGrid() {
    const gridDiv = document.querySelector('#tasksGrid');
    if (!gridDiv) return;

    const gridOptions = {
        animateRows: true,
        enableRtl: true,
        pagination: false,
        paginationPageSize: 20,
        paginationPageSizeSelector: [10, 20, 50, 100],
        rowHeight: 46,

        // اعمال کلاس خط‌خوردگی روی ردیف‌های انجام‌شده
        rowClassRules: {
            'task-row-completed': (params) => isTaskCompleted(params.data)
        },

        columnDefs: [
            // {
            //     field: "Id",
            //     headerName: "شناسه",
            //     width: 85,
            //     valueGetter: (params) => params.data?.Id ?? params.data?.id,
            //     sortable: true
            // },
            {
                field: "Title",
                headerName: "عنوان تسک",
                flex: 2,
                minWidth: 300,
                valueGetter: (params) => params.data?.Title ?? params.data?.title ?? "—",
                cellRenderer: (params) => {
                    const done = isTaskCompleted(params.data);
                    const strikeStyle = done ? "text-decoration: line-through; opacity: 0.65;" : "font-weight: 500;";
                    const icon = done ? "✅" : "📌";
                    return `<span style="${strikeStyle}"><span style="margin-left: 6px;">${icon}</span>${params.value}</span>`;
                }
            },
            {
                field: "Context",
                headerName: "کانتکست",
                width: 170,
                valueGetter: (params) => {
                    return params.data?.Context ?? params.data?.context ??
                           params.data?.ContextId ?? params.data?.contextId ?? 
                           params.data?.context_id ?? params.data?.category;
                },
                cellRenderer: (params) => renderContextBadge(params.value),
                valueFormatter: (params) => {
                    if (!params.value) return "—";
                    const meta = contextsMap.get(String(params.value).toLowerCase().trim());
                    return meta ? `${meta.icon} ${meta.titleFa}` : params.value;
                },
                sortable: true,
                filter: true
            },
            {
                field: "ProjectIdTitle",
                headerName: "پروژه والد",
                width: 150,
                
                cellRenderer: (params) => {
                    if (!params.value) return `<span style="color:#94a3b8;">بدون پروژه</span>`;
                    return `<span class="project-tag">📁 #${params.value}</span>`;
                }
            },
        
                    { 
                field: "PriorityIdTitle", 
                headerName: "اولویت", 
                width: 120,
                // valueGetter: (params) => params.data?.Priority ?? params.data?.priority,
                // cellRenderer: (params) => renderPriorityBadge(params.value),
                sortable: true
            },
            { 
                field: "StatusIdTitle", 
                headerName: "وضعیت", 
                width: 130,
               
                sortable: true
            },
            { 
                field: "AreaIdTitle", 
                headerName: "حوزه مسئولیت", 
                flex: 1,
                //valueGetter: (params) => params.data?.Description ?? params.data?.description ?? "—"
            },
           
             {
                headerName: "عملیات",
                width: 190,
                sortable: false,
                filter: false,
                resizable: false,
                cellRenderer: taskActionsRenderer
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
    // ۴. دریافت و لود اولیه داده‌ها
    await refreshGrid();


}
document.addEventListener('DOMContentLoaded',  () => {
    initTasksGrid();
    initButtons();
});
function initButtons() {

     const gridDiv = document.getElementById("tasksGrid");
      gridDiv?.addEventListener("click", function (event) {
        // ممکن است کلیک روی خود i داخل دکمه باشد
        const editButton = event.target.closest(".js-task-edit");

        if (editButton) {
            handleEditTask(editButton, event);
            return;
        }

       

        const deleteButton = event.target.closest(".js-task-delete");

        if (deleteButton) {
            //handleDeleteTask(deleteButton, event);
        }
    });
}


function handleEditTask(button, event) {
    event.preventDefault();
    const taskId = button.dataset.taskId;
     window.location.href = window.appUrl(`/tasks/edit.html?id=${encodeURIComponent(taskId)}`);
}


