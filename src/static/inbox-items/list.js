let gridApi = null; 
// نگه‌دارنده انواع اینباکس جهت جستجو، رندر و فیلتر سریع (O(1))
const inboxTypesMap = new Map();

// تابع بارگذاری و کش کردن انواع اینباکس از شیت Lookups
async function loadInboxTypesLookup() {
    try {
        // بسته به بک‌اند شما، مثلا action: "listLookups" یا دریافت مستقیم لوکاپ‌ها
        const response = await window.ApiClient1.get({
            action: "getLookupsByType",
            type: "INBOX_TYPE" // اگر بک‌اند فیلتر دارد، وگرنه در فرانت فیلتر می‌شود
        });

        const items = (response && response.ok && Array.isArray(response.data))
            ? response.data
            : (Array.isArray(response) ? response : []);

        inboxTypesMap.clear();

        // فیلتر مواردی که Type آنها دقیقا INBOX_TYPE است
        const inboxTypeItems = items.filter(item => {
            const type = String(item.Type ?? item.type ?? "").trim();
            // اگر از قبل در بک‌اند فیلتر نشده باشد
            return type === "" || type === "INBOX_TYPE";
        });

        inboxTypeItems.forEach(lookup => {
            const id = String(lookup.Id ?? lookup.id ?? "").trim();
            const title = String(lookup.Title ?? lookup.title ?? lookup.title_fa ?? id).trim();
            const color = lookup.Color ?? lookup.color ?? "#0284c7"; // رنگ پیش‌فرض ملایم

            const meta = {
                id: id,
                title: title,
                icon: lookup.Icon ?? lookup.icon ?? "📥",
                color: color,
                bgColor: hexToRgba(color, 0.12)
            };

            if (id) {
                inboxTypesMap.set(id, meta);
            }
        });
    } catch (err) {
        console.warn("خطا در بارگذاری جدول Lookups (INBOX_TYPE):", err);
    }
}





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
function renderInboxTypeBadge(val) {
    if (val === null || val === undefined || val === "") {
        return `<span style="color:#94a3b8;">—</span>`;
    }

    const key = String(val).trim();
    const meta = inboxTypesMap.get(key);

    if (!meta) {
        return `<span class="badge" style="background:#f1f5f9; color:#475569;">📂 ${escapeHtml(key)}</span>`;
    }

    return `
        <span class="badge" 
              style="background-color: ${meta.bgColor}; color: ${meta.color}; border: 1px solid ${meta.color}33;">

            <span>${escapeHtml(meta.title)}</span>
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

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
function inboxItemActionsRenderer(params) {
    const inboxItem = params.data;

    if (!inboxItem) return "";

    const container = document.createElement("div");

    container.className = "d-flex align-items-center gap-1";

    container.innerHTML = `
       

        <button
            type="button" 
            class="btn btn-sm btn-light-warning js-inbox-item-edit"
            data-inbox-item-id="${escapeHtml(inboxItem.Id)}"
            title="ویرایش کار">
            <i class="fas fa-edit"></i>
        </button>

        <button
            type="button"
            class="btn btn-sm btn-light-danger js-inbox-item-delete"
            data-inbox-item-id="${escapeHtml(inboxItem.Id)}"
            title="حذف کار">
            <i class="fas fa-trash"></i>
        </button>
    `;

    return container;
}
async function refreshGrid() {
        const gridDiv = document.querySelector('#inboxItemsGrid');
       try {
        gridDiv.dataset.loading = "true";

        // دریافت موازی و هم‌زمان تسک‌ها و کانتکست‌ها
        // const [_, tasksResponse] = await Promise.all([
        //     loadContextsLookup(),
        //     window.ApiClient1.get({ action: "listTasks" })
        // ]);
 // فراخوانی API


        // دریافت موازی لوکاپ نوع‌ها و لیست اینباکس
        const [_, response] = await Promise.all([
            loadInboxTypesLookup(),
            window.ApiClient1.get({ action: "getInboxItemList" })
        ]);
      
        gridApi.setGridOption("rowData", Array.isArray(response) ? response : []);
    } catch (error) {
        console.error("خطا در بارگذاری تسک‌ها:", error);
    } finally {
        gridDiv.dataset.loading = "false";
    }
}
// ۲. راه‌اندازی گرید تسک‌ها
async function initInboxItemsGrid() {
    const gridDiv = document.querySelector('#inboxItemsGrid');
    if (!gridDiv) return;
  // ۱. حتما اول لوکاپ‌ها را لود می‌کنیم تا مپ قبل از ایجاد فیلتر پر باشد
   // await loadInboxTypesLookup();


    const gridOptions = {
        animateRows: true,
        enableRtl: true,
        pagination: false,
        paginationPageSize: 20,
        paginationPageSizeSelector: [10, 20, 50, 100],
        rowHeight: 46,

       

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
                minWidth:200
                
            },
{
    field: "Type",
    headerName: "نوع",
    width: 170,
    // انتخاب فیلتر Set Filter یا Text Filter
    filter: "agSetColumnFilter", 
    filterParams: {
        // ۱. تزریق مستقیم تمام عنوان‌های لوکاپ به منوی فیلتر
        values: (params) => {
            const allTitles = Array.from(inboxTypesMap.values()).map(m => m.title);
            // ارسال لیست کامل مقادیر به AG Grid
            params.success(allTitles.length > 0 ? allTitles : null);
        },
        // جستجوی سریع داخل پاپ‌آپ فیلتر
        applyMiniFilterWhileTyping: true,
        defaultToNothingSelected: false
    },
    // استخراج عنوان خوانا برای مقایسه و فیلتر
    valueGetter: (params) => {
        const rawId = String(params.data?.Type ?? params.data?.type ?? "").trim();
        if (!rawId) return "";
        const meta = inboxTypesMap.get(rawId);
        return meta ? meta.title : (params.data?.Type_Title || rawId);
    },
    cellRenderer: (params) => {
        const rawId = String(params.data?.Type ?? params.data?.type ?? "").trim();
        return renderInboxTypeBadge(rawId);
    }
},

             {
                headerName: "عملیات",
                width: 190,
                sortable: false,
                filter: false,
                resizable: false,
                cellRenderer: inboxItemActionsRenderer
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
// ارسال نتیجه به والد (پنجره اصلی)
 function sendSelection(id, title) {

   // ارسال رویداد جهت رفرش دراپ‌داون‌ها و لیست‌ها در صفحه والد
      const notifyPayload = {
        type: "ENTITY_PICKED",
        data: { id: id, title: title }
      };

      if (window.parent && window.parent !== window) {
        window.parent.postMessage(notifyPayload, "*");
      }

      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(notifyPayload, "*");
      }
}
document.addEventListener('DOMContentLoaded',  () => {
    initInboxItemsGrid();
    initButtons();
});


function initButtons() {
    document.getElementById('AddInboxItem')?.addEventListener('click', handleAddInboxItem);

     const gridDiv = document.getElementById("inboxItemsGrid");
      gridDiv?.addEventListener("click", function (event) {
        // ممکن است کلیک روی خود i داخل دکمه باشد
        const editButton = event.target.closest(".js-inbox-item-edit");

        if (editButton) {
            handleEditInboxItem(editButton, event);
            return;
        }



        const deleteButton = event.target.closest(".js-inbox-item-delete");

        if (deleteButton) {
            handleDeleteInboxItem(deleteButton, event);
        }
    });
}

async function handleAddInboxItem(event) {
     event.preventDefault();

    openPopup({
        url: window.appUrl('/inbox-items/create.html'),
        onMessage: async function (data) {
            console.log('داده دریافتی از پاپ‌آپ:', data);

            if (data && data.type === 'INBOXITEM_SAVED') {
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

function handleEditInboxItem(button, event) {
    event.preventDefault();
    const inboxItemId = button.dataset.inboxItemId;
    openPopup({
        url: window.appUrl(`/inbox-items/edit.html?id=${encodeURIComponent(inboxItemId)}`),
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


