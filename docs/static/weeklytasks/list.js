// متغیر سراسری برای دسترسی به API گرید
let gridApi = null; 
// ۱. تابع کمکی استخراج DisplayOrder با Fallback ایمن
function getDisplayOrder(data) {
    if (!data) return 999999;
    const order = data.DisplayOrder ?? data.displayOrder ?? data.display_order;
    const num = Number(order);
    return isNaN(num) ? 999999 : num;
}

function parseShamsiDateTime(val) {
    if (!val) return { date: "—", time: "—" };
    
    const str = String(val).trim();
    const parts = str.split(/\s+/);
    
    let timeFormatted = "—";
    if (parts[1]) {
        timeFormatted = parts[1].substring(0, 5);
    }

    return {
        date: parts[0] || "—",
        time: timeFormatted
    };
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
function projectActionsRenderer(params) {
    const sprintItem = params.data;

    if (!sprintItem) return "";

    const container = document.createElement("div");

    container.className = "d-flex align-items-center gap-1";

    container.innerHTML = `
        <button
            type="button"
            class="btn btn-sm btn-light-primary js-sprint-item-add-child"
            data-sprint-item-id="${escapeHtml(sprintItem.id)}"
            
            title="افزودن زیرحساب">
            <i class="fas fa-plus"></i>
        </button>

     

        <button
            type="button"
            class="btn btn-sm btn-light-danger js-sprint-item-delete"
            data-sprint-item-id="${escapeHtml(sprintItem.id)}"
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
// ۵. تابع اصلاح‌شده ساخت مسیر درختی با ریشه مجازی روتین‌ها و گروه‌بندی روزانه
function mapTreeData(items) {
    const map = new Map();

    // گام اول: نگاشت آیتم‌های ساختاری (پروژه‌ها و تسک‌ها) بر اساس ParentId
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

    // گام دوم: تولید مسیر سلسله‌مراتبی
    return items.map(item => {
        const nodeType = getNodeType(item);
        const rawDate = item.DateShamsi || item.plannedDate || "";
        const dateLabel = rawDate ? String(rawDate).trim().split(/\s+/)[0] : "بدون تاریخ";
        const title = item.Title || item.title || item.TaskDescription || `آیتم #${item.Id ?? item.id}`;

        // 🎯 بخش اصلاح‌شده: گروه‌بندی روتین‌ها زیر ریشه مجازی "روتین‌ها" و روز مربوطه
        if (nodeType === "ROUTINE") {
            return {
                ...item,
                orgHierarchy: ["روتین‌ها", dateLabel, title]
            };
        }

        // سایر آیتم‌ها (پروژه‌ها و وظایف): پیمایش زنجیره والدها
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
        groupDefaultExpanded: 1, // سطح اول (شامل ریشه روتین‌ها و پوشه‌ها) به صورت پیش‌فرض باز باشد

        // مرتب‌سازی ردیف‌ها
        postSortRows: (params) => {
            const rowNodes = params.nodes;
            rowNodes.sort((a, b) => {
                const orderA = getDisplayOrder(a.data);
                const orderB = getDisplayOrder(b.data);

                if (orderA !== orderB) return orderA - orderB;
                const idA = String(a.data?.Id || a.data?.id || "");
                const idB = String(b.data?.Id || b.data?.id || "");
                return idA.localeCompare(idB);
            });
        },

        // استایل‌دهی ردیف‌ها
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
                    const val = params.value || "";
                    
                    // هندل کردن گره‌های مجازی (روتین‌ها و تاریخ‌ها)
                    if (!params.data) {
                        if (val === "روتین‌ها") {
                            return `<span style="font-weight:700; color:#b45309; display:inline-flex; align-items:center; gap:6px;">🔄 روتین‌ها</span>`;
                        }
                        // گره‌های تاریخ زیر روتین‌ها
                        return `<span style="font-weight:600; color:#475569; display:inline-flex; align-items:center; gap:6px;">📅 ${val}</span>`;
                    }

                    const type = getNodeType(params.data);
                    let icon = "✅";
                    if (type === "FOLDER") icon = "📁";
                    else if (type === "PROJECT") icon = "🚀";
                    else if (type === "ROUTINE") icon = "🔄";

                    const isBold = isGroupNode(params.data);
                    const titleText = val || params.data.Title || "(بدون عنوان)";
                    
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

        // ستون‌های اطلاعاتی
        columnDefs: [
             {
                headerName: "تاریخ برنامه ریزی شده",
                width: 135,
                sortable: true,
                valueGetter: (params) => {
                    const raw = params.data?.DateShamsi ?? params.data?.plannedDate;
                    return parseShamsiDateTime(raw).date;
                },
                cellRenderer: (params) => {
                    if (params.value === "—") return `<span style="color:#cbd5e1;">—</span>`;
                    return `<span style="font-family:inherit; direction:ltr; display:inline-block; font-weight:500;">${params.value}</span>`;
                }
            },
            {
                headerName: "ساعت برنامه ریزی شده",
                width: 100,
                sortable: true,
                valueGetter: (params) => {
                    const raw = params.data?.plannedDate;
                    return parseShamsiDateTime(raw).time;
                },
                cellRenderer: (params) => {
                    if (params.value === "—") return `<span style="color:#cbd5e1;">—</span>`;
                    return `<span style="font-family:inherit; direction:ltr; display:inline-block; color:#475569; font-weight:500;">${params.value}</span>`;
                }
            },
            {
                headerName: "نوع رکورد",
                width: 120,
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
                field: "energyLevel", 
                headerName: "سطح انرژی", 
                width: 110,
                sortable: true
            },
              {
                headerName: "عملیات",
                width: 190,
                sortable: false,
                filter: false,
                resizable: false,
                cellRenderer: projectActionsRenderer
            }
        ],

        defaultColDef: {
            resizable: true,
            sortable: true,
            filter: true
        }
    };

    // ایجاد گرید
     gridApi = agGrid.createGrid(gridDiv, gridOptions);
  // ۴. دریافت و لود اولیه داده‌ها
    await refreshGrid();
  
}
async function refreshGrid() {
      const gridDiv = document.querySelector('#myGrid');
  try {
        gridDiv.dataset.loading = "true";

        const response = await window.ApiClient1.get({
            action: "getWeeklyTreePlan",
            sprintId:"01e16267-e402-4448-8dbe-e59a42068879"
        });

        let rawItems = [];
        if (response && response.ok && Array.isArray(response.data)) {
            rawItems = response.data;
        } else if (Array.isArray(response)) {
            rawItems = response;
        }

        // مرتب‌سازی اولیه
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
// اتصال به افزونه کروم تایمر
window.startLifeFlowTimer = function(planId, taskId, projectId, encodedTitle) {
    const title = decodeURIComponent(encodedTitle);
    
    if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({
            action: "START_TIMER",
            payload: { planId, taskId, projectId, title }
        }, (response) => {
            console.log("پاسخ افزونه تایمر:", response);
        });
    } else {
        localStorage.setItem("lifeFlow_active_timer", JSON.stringify({
            planId, taskId, projectId, title, startTime: Date.now()
        }));
        alert(`تایمر برای «${title}» فعال شد.`);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initWeeklyTreeGrid("1403-W25"); 
        initButtons();
});
function initButtons() {
    document.getElementById('AddItem')?.addEventListener('click', handleAddAccount);
    //document.getElementById('btnAddChildAccount')?.addEventListener('click', handleAddChildAccount);
   
     const gridDiv = document.getElementById("myGrid");
      gridDiv?.addEventListener("click", function (event) {
        // ممکن است کلیک روی خود i داخل دکمه باشد
        const editButton = event.target.closest(".js-project-edit");

        if (editButton) {
           // handleEditAccount(editButton, event);
            return;
        }

        const addChildButton = event.target.closest(".js-sprint-item-add-child");

        if (addChildButton) {
            handleAddChildProject(addChildButton, event);
            return;
        }

        const deleteButton = event.target.closest(".js-sprint-item-delete");

        if (deleteButton) {
            handleDeleteAccount(deleteButton, event);
        }
    });
}

async function handleAddAccount(event) {
     event.preventDefault();

    openPopup({
        url: window.appUrl('/weeklytasks/select-task-project-modal.html'),
                    large: true,
            flex: true,
            backdrop: 'static',
            scrollable: false,
       onMessage: async function (data) {
            if (data && data.type === 'SPRINT_ITEMS_ADDED') {
                closePopup();
                await refreshGrid();
            }
        }
    });
}
function handleAddChildProject(button, event) {
     event.preventDefault();
debugger;
    const projectId = button.dataset.sprintItemId;
   // const projectTitle = button.dataset.projectTitle || '';

     const query = new URLSearchParams({
            parentId: projectId
            }).toString();
    openPopup({
        url: window.appUrl(`/weeklytasks/select-task-project-modal.html?${query}`),
          large: true,
            flex: true,
            backdrop: 'static',
            scrollable: false,
        onMessage: async function (data) {
            if (data && data.type === 'SPRINT_ITEMS_ADDED') {
                closePopup();
                await refreshGrid();
            }
        }
    });
}
function handleEditAccount(button, event) {
    event.preventDefault();
    const projectId = button.dataset.projectId;
    openPopup({
        url: window.appUrl(`/projects/edit.html?id=${encodeURIComponent(projectId)}`),
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


async function handleDeleteAccount(button, event) {
    event.preventDefault();

  const confirmed = confirm("آیا از حذف اطمینان دارید؟");
  if (!confirmed) return;
   const sprintItemId = button.dataset.sprintItemId;
  try {
    const response = await window.ApiClient1.post(
      "deleteSprintItem",
      { Id: sprintItemId },
      {
        requestPrefix: "task",
        endpoint: "/tasks/delete"
      }
    );

    if (!response || response.ok === false) {
      throw new Error(response?.error || response?.message || "خطا در حذف تسک.");
    }

    else {
      displayNotification("تسک با موفقیت حذف شد.", "success");
          refreshGrid();
    }

    // اگر در AG Grid هستید، ردیف را بدون رفرش صفحه از حافظه حذف کنید:
    // if (typeof gridApi !== "undefined" && gridApi) {
    //   const rowNode = gridApi.getRowNode(String(taskId)) || gridApi.getRowNode("task_" + String(taskId));
    //   if (rowNode) {
    //     gridApi.applyTransaction({ remove: [rowNode.data] });
    //   }
    // }

    // // ارسال رویداد حذف به صفحه والد در صورت نیاز
    // const notifyPayload = {
    //   type: "TASK_DELETED",
    //   id: taskId
    // };

    // if (window.parent && window.parent !== window) {
    //   window.parent.postMessage(notifyPayload, "*");
    // }
    // if (window.opener && !window.opener.closed) {
    //   window.opener.postMessage(notifyPayload, "*");
    // }

  } catch (error) {
    console.error("[Delete Task Error]:", error);
    alert(error.message || "خطا در فرآیند حذف تسک.");
  }
}
