/**
 * LifeFlow Transactions Master-Detail View
 * Engine: AG Grid Enterprise (Client/Server Mode) + ABP.io Proxies
 * UX/UI & Financial Redesign: Clean, Densified, Monospace Currency, Smart Transfer Flows
 */

let transactionsGridApi = null;

// ۱. توابع کمکی فرمت‌دهی
const formatters = {
    currency: (val) => {
        if (val === null || val === undefined || isNaN(val)) return '۰';
        return Number(val).toLocaleString('fa-IR');
    },
    persianDateTime: (utcDateStr) => {
        if (!utcDateStr) return '—';
        const d = new Date(utcDateStr);
        return new Intl.DateTimeFormat('fa-IR', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        }).format(d);
    },
    escapeHtml: (str) => {
        return String(str ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
};

// ۲. رندرهای بصری (Badges & Renderers)
function renderTransactionTypeBadge(type) {
    const map = {
        1: { label: "هزینه", bg: "#fee2e2", text: "#991b1b", icon: "💸" },
        2: { label: "درآمد", bg: "#dcfce7", text: "#166534", icon: "💰" },
        3: { label: "انتقال", bg: "#e0f2fe", text: "#0369a1", icon: "🔁" }
    };
    const t = map[type] || { label: "سایر", bg: "#f1f5f9", text: "#475569", icon: "•" };
    return `<span class="badge px-2 py-1" style="background:${t.bg}; color:${t.text}; border:1px solid ${t.text}22; font-size: 0.75rem;">
                ${t.icon} ${t.label}
            </span>`;
}

function renderItemTypeBadge(itemType) {
    const map = {
        1: { label: "کالا", bg: "#eff6ff", text: "#1d4ed8" },
        2: { label: "خدمت", bg: "#faf5ff", text: "#7e22ce" },
        3: { label: "کارمزد", bg: "#fff7ed", text: "#c2410c" },
        4: { label: "تخفیف", bg: "#fef2f2", text: "#b91c1c" }
    };
    const item = map[itemType] || { label: "اقلام", bg: "#f8fafc", text: "#64748b" };
    return `<span class="badge" style="background:${item.bg}; color:${item.text}; border:1px solid ${item.text}22;">
                ${item.label}
            </span>`;
}

function transactionActionsRenderer(params) {
    const row = params.data;
    if (!row) return '';

    const receiptPath = row.receiptAttachmentPath || row.ReceiptAttachmentPath;

    return `
        <div class="d-flex align-items-center gap-1 justify-content-center h-100">
            ${receiptPath ? `
                <button type="button" class="btn btn-sm btn-icon btn-light-info js-btn-receipt" data-path="${formatters.escapeHtml(receiptPath)}" title="مشاهده رسید">
                    <i class="fas fa-file-invoice"></i>
                </button>` : ''}
            <button type="button" class="btn btn-sm btn-icon btn-light-warning js-btn-edit" data-id="${row.id || row.Id}" title="ویرایش">
                <i class="fas fa-edit"></i>
            </button>
            <button type="button" class="btn btn-sm btn-icon btn-light-danger js-btn-delete" data-id="${row.id || row.Id}" title="حذف">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
}

// ۳. پیکربندی Master-Detail (Detail Row Renderer)
function getDetailGridConfiguration() {
    return {
        detailGridOptions: {
            enableRtl: true,
            domLayout: 'autoHeight',
            rowHeight: 40,
            defaultColDef: {
                sortable: true,
                resizable: true
            },
            columnDefs: [
                { field: "sortOrder", headerName: "#", width: 60, sort: 'asc' },
                { field: "title", headerName: "عنوان قلم", flex: 2, minWidth: 160 },
                { 
                    field: "itemType", 
                    headerName: "نوع قلم", 
                    width: 100, 
                    cellRenderer: p => renderItemTypeBadge(p.value) 
                },
                { 
                    field: "quantity", 
                    headerName: "مقدار", 
                    width: 90, 
                    valueFormatter: p => (p.value ? `${formatters.currency(p.value)} ${p.data.unit || p.data.Unit || ''}` : '—') 
                },
                { 
                    field: "unitPrice", 
                    headerName: "فی (تومان)", 
                    width: 120, 
                    valueFormatter: p => formatters.currency(p.value) 
                },
                { 
                    field: "grossPrice", 
                    headerName: "مبلغ ناخالص", 
                    width: 120, 
                    valueFormatter: p => formatters.currency(p.value) 
                },
                { 
                    field: "discountAmount", 
                    headerName: "تخفیف", 
                    width: 110, 
                    valueFormatter: p => formatters.currency(p.value) 
                },
                { 
                    field: "totalPrice", 
                    headerName: "مبلغ نهایی", 
                    width: 130, 
                    cellStyle: { fontWeight: 'bold' },
                    valueFormatter: p => formatters.currency(p.value) 
                },
                { field: "categoryTitle", headerName: "دسته‌بندی", width: 140 },
                { field: "note", headerName: "یادداشت", flex: 1 }
            ]
        },
        getDetailRowData: async function (params) {
            const row = params.data;
            const hasItems = row.hasItems ?? row.HasItems;
            const transactionId = row.id || row.Id;

            if (!row || !hasItems) {
                params.successCallback([]);
                return;
            }
            try {
                const items = await lifeFlow.finance.transaction.getItems(transactionId);
                params.successCallback(items || []);
            } catch (err) {
                console.error("خطا در واکشی اقلام تراکنش:", err);
                params.successCallback([]);
            }
        }
    };
}

// ۴. ایجاد گرید اصلی (Master Grid) با معماری خلوت و بهینه
async function initTransactionsGrid() {
    const gridDiv = document.querySelector('#transactionsGrid');
    if (!gridDiv) return;

    const gridOptions = {
        enableRtl: true,
        animateRows: true,
        masterDetail: true,
        isRowMaster: (dataItem) => Boolean(dataItem?.hasItems ?? dataItem?.HasItems),
        detailRowAutoHeight: true,
        detailCellRendererParams: getDetailGridConfiguration(),
        rowHeight: 52,
        pagination: true,
        paginationPageSize: 20,
        paginationPageSizeSelector: [20, 50, 100],

        columnDefs: [
            // ۱. دکمه باز/بسته کردن جزئیات (Master Toggle)
            {
                headerName: "",
                field: "masterDetailToggle",
                cellRenderer: "agGroupCellRenderer",
                width: 45,
                minWidth: 45,
                maxWidth: 45,
                resizable: false,
                sortable: false,
                filter: false,
                cellRendererParams: { suppressCount: true }
            },
            // ۲. تاریخ و ساعت (دوخطی، راست‌چین LTR برای ناخوانا نشدن ارقام تاریخ)
            {
    field: "persianDate",
    headerName: "زمان تراکنش",
    width: 140,
    sort: 'desc',
    // اجازه دادن به سلول برای شکست سطر و چیدمان عمودی
    cellStyle: { 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        lineHeight: '1.2' 
    },
    cellRenderer: params => {
        const val = params.value || params.data?.creationTime || params.data?.CreationTime;
        if (!val) return '<span class="text-muted">—</span>';

        let date = '';
        let time = '';

        // اگر تاریخ شمسی با فرمت "1405/07/29 12:11" پاس داده شده:
        if (typeof val === 'string' && val.includes(' ')) {
            const parts = val.trim().split(/\s+/);
            date = parts[0] || '';
            time = parts[1] || '';
        } 
        // اگر فرمت ISO یا استاندارد میلادی است (2026-09-10T17:08:00):
        else {
            try {
                const d = new Date(val);
                const formatted = new Intl.DateTimeFormat('fa-IR', {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit', hour12: false
                }).format(d);
                // خروجی معمولاً به صورت "1405/07/04،‏ 23:12" است
                const parts = formatted.split(/[،,]\s*/);
                date = parts[0] || '';
                time = parts[1] || '';
            } catch (e) {
                date = String(val);
            }
        }

        return `
            <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%; direction: ltr; font-variant-numeric: tabular-nums;">
                <span style="font-weight: 600; color: #1e293b; font-size: 0.82rem; line-height: 1.3;">${date}</span>
                ${time ? `<span style="color: #64748b; font-size: 0.72rem; line-height: 1.2; margin-top: 1px;">${time}</span>` : ''}
            </div>
        `;
    }
},
            // ۳. نوع تراکنش و آیکون نوع
            {
                field: "type",
                headerName: "نوع",
                width: 100,
                cellRenderer: p => renderTransactionTypeBadge(p.value)
            },
            // ۴. شرح و ذی‌نفع (ادغام شرح بانک، یادداشت کاربر و بج تعداد اقلام/پیوست)
            {
                headerName: "شرح و ذی‌نفع / طرف حساب",
                minWidth: 240,
                flex: 2,
                cellRenderer: params => {
                    const data = params.data;
                    if (!data) return '';

                    const counterparty = data.contactTitle || data.counterparty || '';
                    const bankDesc = data.bankDescription || data.BankDescription || '';
                    const userNote = data.userNote || data.UserNote || '';
                    
                    //const mainTitle = counterparty ? `${counterparty} ${bankDesc ? '— ' + userNote : ''}` : (userNote || userNote || 'بدون شرح');

                     const mainTitle = userNote;

                    const subText = (counterparty && bankDesc) ? userNote : (counterparty ? bankDesc : '');

                    const hasItems = data.hasItems ?? data.HasItems;
                    const itemsCount = data.itemsCount ?? data.ItemsCount;
                    const itemsBadge = hasItems 
                        ? `<span class="badge bg-light text-primary border ms-1" style="font-size: 0.65rem;" title="تراکنش چندقلمی">${itemsCount ? itemsCount + ' قلم' : 'چندقلمی'}</span>` 
                        : '';

                    const receiptPath = data.receiptAttachmentPath || data.ReceiptAttachmentPath;
                    const receiptIcon = receiptPath 
                        ? `<i class="bi bi-paperclip text-muted ms-1" style="font-size: 0.8rem;" title="دارای رسید پیوست"></i>` 
                        : '';

                    return `
                        <div class="d-flex flex-column justify-content-center h-100 py-1">
                            <div class="d-flex align-items-center text-truncate">
                                <span class="fw-medium text-dark text-truncate" title="${formatters.escapeHtml(mainTitle)}">${formatters.escapeHtml(mainTitle)}</span>
                                ${itemsBadge}
                                ${receiptIcon}
                            </div>
                            ${subText ? `<span class="text-muted text-truncate" style="font-size: 0.72rem;" title="${formatters.escapeHtml(subText)}">${formatters.escapeHtml(subText)}</span>` : ''}
                        </div>
                    `;
                }
            },
            // ۵. جریان مالی (مدیریت هوشمند حساب مبدا و مقصد برای انتقال یا نمایش دسته‌بندی هزینه/درآمد)
            {
                headerName: "دسته‌بندی / مسیر جریان",
                minWidth: 170,
                flex: 1,
                cellRenderer: params => {
                    const data = params.data;
                    if (!data) return '';

                    // حالت انتقال (Transfer)
                    if (data.type === 3) {
                        return `
                            <div class="d-flex align-items-center text-primary small py-1 text-truncate" style="font-size: 0.8rem;">
                                <span class="text-truncate">${data.accountTitle || 'مبدا'}</span>
                                <i class="bi bi-arrow-left mx-1 text-muted" style="font-size: 0.75rem;"></i>
                                <span class="text-truncate">${data.targetAccountTitle || 'مقصد'}</span>
                            </div>
                        `;
                    }

                    // حالت عادی (هزینه / درآمد)
                    const categoryTitle = data.categoryTitle || 'بدون دسته‌بندی';
                    return `
                        <div class="d-flex align-items-center py-1">
                            <span class="badge bg-light text-primary border px-2 py-1 text-truncate" style="font-size: 0.75rem; font-weight: normal;">
                                <i class="bi bi-tag me-1 text-muted"></i>
                                ${formatters.escapeHtml(categoryTitle)}
                            </span>
                        </div>
                    `;
                }
            },
            // ۶. حساب مالی
            {
                field: "accountTitle",
                headerName: "حساب مالی",
                width: 130,
                cellRenderer: params => {
                    const title = params.value || '—';
                    return `
                        <div class="d-flex align-items-center h-100 text-truncate" style="font-size: 0.85rem;">
                            <i class="bi bi-wallet2 text-muted me-1.5" style="font-size: 0.8rem;"></i>
                            <span class="text-truncate" title="${formatters.escapeHtml(title)}">${formatters.escapeHtml(title)}</span>
                        </div>
                    `;
                }
            },
            // ۷. مبلغ کل (قلب تپنده جدول با فونت Monospace و علامت‌های حسابداری)
            {
                field: "amount",
                headerName: "مبلغ (تومان)",
                width: 150,
                cellClass: "text-end",
                cellRenderer: params => {
                    const data = params.data;
                    if (!data) return '';

                    let sign = '';
                    let colorClass = 'text-dark';
                    const type = data.type;

                    if (type === 1) {
                        sign = '-';
                        colorClass = 'text-danger';
                    } else if (type === 2) {
                        sign = '+';
                        colorClass = 'text-success';
                    } else if (type === 3) {
                        sign = '⇄';
                        colorClass = 'text-primary';
                    }

                    const isReconciled = data.isReconciled ?? data.IsReconciled;
                    const reconciledStatus = isReconciled 
                        ? `<i class="bi bi-check-circle-fill text-success ms-1" style="font-size: 0.75rem;" title="تطبیق‌داده‌شده با بانک"></i>`
                        : `<i class="bi bi-dash-circle text-black-50 ms-1" style="font-size: 0.75rem;" title="تطبیق‌نشده"></i>`;

                    const formattedAmount = formatters.currency(data.amount);

                    return `
                        <div class="d-flex align-items-center justify-content-end h-100">
                            ${reconciledStatus}
                            <span class="fw-bold ${colorClass} font-monospace ms-1" style="font-size: 0.9rem; letter-spacing: -0.3px;">
                                ${sign} ${formattedAmount}
                            </span>
                        </div>
                    `;
                }
            },
            // ۸. ستون عملیات سنجاق‌شده به چپ
            {
                headerName: "عملیات",
                width: 100,
                pinned: 'left',
                sortable: false,
                filter: false,
                cellRenderer: transactionActionsRenderer
            }
        ],

        defaultColDef: {
            resizable: true,
            sortable: true,
            filter: true
        }
    };

    transactionsGridApi = agGrid.createGrid(gridDiv, gridOptions);
    await reloadTransactions();
}

// ۵. بارگذاری اطلاعات و به‌روزرسانی هدر خلاصه مالی
async function reloadTransactions() {
    try {
        const gridDiv = document.querySelector('#transactionsGrid');
        if (gridDiv) gridDiv.dataset.loading = "true";

        const [summary, pagedResult] = await Promise.all([
            lifeFlow.finance.transaction.getSummary({}),
            lifeFlow.finance.transaction.getList({ maxResultCount: 200, skipCount: 0 })
        ]);

        if (summary) {
            updateSummaryHeader(summary);
        }

        if (transactionsGridApi) {
            transactionsGridApi.setGridOption("rowData", pagedResult.items || []);
        }

    } catch (err) {
        console.error("خطا در بارگذاری لیست تراکنش‌ها:", err);
    } finally {
        const gridDiv = document.querySelector('#transactionsGrid');
        if (gridDiv) gridDiv.dataset.loading = "false";
    }
}

function updateSummaryHeader(s) {
    if (!s) return;
    const elExpense = document.getElementById("sumTotalExpense") || document.getElementById("summary-expense");
    const elIncome = document.getElementById("sumTotalIncome") || document.getElementById("summary-income");
    const elCount = document.getElementById("sumReconciledCount") || document.getElementById("summary-count");

    if (elExpense) elExpense.textContent = formatters.currency(s.totalExpense) + ' تومان';
    if (elIncome) elIncome.textContent = formatters.currency(s.totalIncome) + ' تومان';
    if (elCount) elCount.textContent = (s.reconciledCount !== undefined) 
        ? `${s.reconciledCount} از ${s.totalCount}` 
        : formatters.currency(s.transactionCount || s.totalCount || 0);
}

// ۶. تابع استاندارد حذف با پیام تأیید ABP
function deleteTransaction(id) {
    abp.message.confirm("آیا از حذف این تراکنش و تمام اقلام وابسته به آن اطمینان دارید؟", "تأیید حذف")
        .then(function (confirmed) {
            if (!confirmed) return;

            lifeFlow.finance.transaction.delete(id)
                .done(function () {
                    abp.notify.success("تراکنش با موفقیت حذف شد.");
                    reloadTransactions();
                })
                .fail(function (err) {
                    abp.ajax.handleError(err);
                });
        });
}

// ۷. رویدادهای صفحه و لیسنرها
document.addEventListener('DOMContentLoaded', () => {
    initTransactionsGrid();

    const gridEl = document.getElementById("transactionsGrid");
    gridEl?.addEventListener("click", (e) => {
        const btnEdit = e.target.closest(".js-btn-edit");
        if (btnEdit) {
            const id = btnEdit.dataset.id;
            openPopup({
                url: window.appUrl(`/transactions/edit.html?id=${id}`),
                title: "ویرایش تراکنش",
                large: true,
                onMessage: async function (data) {
             closePopup();
                await reloadTransactions();
            // if (data && data.type === 'ACCOUNT_SAVED') {
            //     closePopup();
            //     await refreshGrid();
            // }
        }
            });
            return;
        }

        const btnReceipt = e.target.closest(".js-btn-receipt");
        if (btnReceipt) {
            const path = btnReceipt.dataset.path;
            openPopup({ url: window.appUrl(path), title: "مشاهده تصویر رسید" });
            return;
        }

        const btnDelete = e.target.closest(".js-btn-delete");
        if (btnDelete) {
            const id = btnDelete.dataset.id;
            deleteTransaction(id);
        }
    });
});

// شنود پیام‌های پست‌شده از پاپ‌آپ‌ها (فرم ویرایش/ثبت یا ایمپورت اکسل)
window.addEventListener("message", (event) => {
    if (event.data?.type === "TRANSACTION_SAVED" || event.data?.action === "statement-imported") {
        reloadTransactions();
    }
});

// دکمه‌های صفحه اصلی
document.getElementById("AddTransaction")?.addEventListener("click", () => {
    openPopup({
        url: window.appUrl("/transactions/create.html"),
        title: "ثبت تراکنش جدید",
        large: true,
        flex: true,
        backdrop: 'static',
        scrollable: false
    });
});

document.getElementById("ImportStatement")?.addEventListener("click", () => {
    openPopup({
        url: window.appUrl("/transactions/import-statement-modal.html"),
        title: "ایمپورت صورت‌حساب بانکی",
        large: true,
        flex: true,
        backdrop: 'static',
        scrollable: false
    });
});
