// main.js

function formatCurrency(val) {
  if (val === "" || val === null || val === undefined) return "—";
  const num = Number(val);
  if (isNaN(num)) return val;
  return num.toLocaleString("fa-IR");
}

function normalizeValue(val) {
  return val === "" || val === null || val === undefined ? "—" : val;
}

// کش درون‌برنامه‌ای برای جلوگیری از ریکوئست‌های تکراری هنگام بستن و باز کردن مجدد سطر
const installmentsCache = new Map();

async function initMasterDetailLazyGrid() {
  const gridDiv = document.querySelector("#myGrid");
  if (!gridDiv) return;

  // ۱. کانفیگ جدول ریز اقساط (Detail Grid)
  const detailGridOptions = {
    enableRtl: true,
    columnDefs: [
      {
        field: "installmentNumber",
        headerName: "شماره قسط",
        width: 110,
        valueFormatter: (p) => (p.value ? `قسط ${p.value}` : "—")
      },
      {
        field: "title",
        headerName: "عنوان قسط",
        minWidth: 160,
        flex: 1,
        valueFormatter: (p) => normalizeValue(p.value)
      },
      {
        field: "amount",
        headerName: "مبلغ قسط (تومان)",
        width: 140,
        type: "numericColumn",
        valueFormatter: (p) => formatCurrency(p.value)
      },
      {
        field: "paidAmount",
        headerName: "پرداخت‌شده",
        width: 130,
        type: "numericColumn",
        valueFormatter: (p) => formatCurrency(p.value),
        cellStyle: { color: "#28a745" }
      },
      {
        field: "dueDate",
        headerName: "سررسید",
        width: 120,
        valueFormatter: (p) => normalizeValue(p.value)
      },
      {
        field: "paidDate",
        headerName: "تاریخ پرداخت",
        width: 120,
        valueFormatter: (p) => normalizeValue(p.value)
      },
      {
        field: "status",
        headerName: "وضعیت",
        width: 120,
        cellRenderer: (p) => {
          const val = String(p.value || "").trim();
          if (!val) return "—";
          let badgeClass = "badge bg-secondary";
          if (val === "پرداخت شده" || val === "تسویه") badgeClass = "badge bg-success";
          else if (val === "معوق" || val === "سررسید گذشته") badgeClass = "badge bg-danger";
          else if (val === "در انتظار" || val === "جاری") badgeClass = "badge bg-warning text-dark";
          return `<span class="${badgeClass}">${val}</span>`;
        }
      },
      {
        field: "trackingCode",
        headerName: "کد پیگیری",
        width: 130,
        valueFormatter: (p) => normalizeValue(p.value)
      }
    ],
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true
    }
  };

  // ۲. کانفیگ جدول اصلی تعهدات (Master Grid)
  const masterGridOptions = {
    masterDetail: true,
    detailRowHeight: 220,
    animateRows: true,
    enableRtl: true,
    pagination: true,
    paginationPageSize: 20,
    paginationPageSizeSelector: [10, 20, 50],

    // لاجیک دریافت داده‌های اقساط به صورت Lazy
    detailCellRendererParams: {
      detailGridOptions: detailGridOptions,
      getDetailRowData: async (params) => {
        const obligationId = params.data.obligationId;

        // اگر از قبل در کش بود، بدون ریکوئست مستقیم بده
        if (installmentsCache.has(obligationId)) {
          params.successCallback(installmentsCache.get(obligationId));
          return;
        }

        try {
          // فراخوانی Lazy لود از AppScript
          const response = await window.ApiClient.get({
            action: "listInstallments",
            obligationId: obligationId
          });

          let items = [];
          if (response && response.ok && Array.isArray(response.data)) {
            items = response.data;
          } else if (Array.isArray(response)) {
            items = response;
          }

          // ذخیره در کش
          installmentsCache.set(obligationId, items);
          params.successCallback(items);
        } catch (err) {
          console.error(`خطا در بارگذاری اقساط تعهد ${obligationId}:`, err);
          params.successCallback([]);
        }
      }
    },

    columnDefs: [
      {
        field: "title",
        headerName: "عنوان تعهد / پرونده",
        minWidth: 260,
        flex: 2,
        cellRenderer: "agGroupCellRenderer", // اضافه شدن دکمه [+]
        cellRendererParams: {
          suppressCount: false
        }
      },
      {
        field: "type",
        headerName: "نوع",
        width: 120,
        cellRenderer: (params) => {
          if (params.node.isRowPinned()) return "";
          const val = normalizeValue(params.value);
          if (val === "—") return val;
          return `<span class="badge bg-light text-dark border">${val}</span>`;
        }
      },
      {
        field: "category",
        headerName: "دسته‌بندی",
        width: 130,
        valueFormatter: (params) => normalizeValue(params.value)
      },
      {
        field: "totalAmount",
        headerName: "مبلغ کل",
        width: 140,
        type: "numericColumn",
        filter: "agNumberColumnFilter",
        valueFormatter: (params) => formatCurrency(params.value),
        cellStyle: (params) => (params.node.isRowPinned() ? { fontWeight: "bold" } : null)
      },
      {
        field: "paidAmount",
        headerName: "پرداخت‌شده",
        width: 130,
        type: "numericColumn",
        filter: "agNumberColumnFilter",
        valueFormatter: (params) => formatCurrency(params.value),
        cellStyle: { color: "#28a745" }
      },
      {
        field: "remainingAmount",
        headerName: "مانده بدهی",
        width: 140,
        type: "numericColumn",
        filter: "agNumberColumnFilter",
        valueFormatter: (params) => formatCurrency(params.value),
        cellStyle: (params) =>
          params.node.isRowPinned() ? { fontWeight: "bold", color: "#dc3545" } : { color: "#dc3545" }
      },
      {
        field: "installmentCount",
        headerName: "تعداد اقساط",
        width: 110,
        valueFormatter: (params) => (params.value ? `${params.value} قسط` : "—")
      },
      {
        field: "dueDate",
        headerName: "سررسید نهایی",
        width: 120,
        valueFormatter: (params) => normalizeValue(params.value)
      },
      {
        field: "status",
        headerName: "وضعیت",
        width: 120,
        cellRenderer: (params) => {
          if (params.node.isRowPinned()) return "";
          const val = String(params.value || "").trim();
          if (!val) return "—";
          let badgeClass = "badge bg-secondary";
          if (val === "پرداخت شده" || val === "تسویه") badgeClass = "badge bg-success";
          else if (val === "معوق" || val === "سررسید گذشته") badgeClass = "badge bg-danger";
          else if (val === "در جریان" || val === "جاری") badgeClass = "badge bg-primary";
          return `<span class="${badgeClass}">${val}</span>`;
        }
      }
    ],

    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true
    },

    // عدم نمایش دکمه [+] برای رکوردهای غیرقسطی و سطر جمع کل
    isRowMaster: (dataItem) => {
    //   if (!dataItem || dataItem.isSummaryRow) return false;
    //   if (dataItem.hasInstallments !== undefined) return Boolean(dataItem.hasInstallments);
    //   if (dataItem.isInstallment !== undefined) return Boolean(dataItem.isInstallment);
      return true;
    }
  };

  const gridApi = agGrid.createGrid(gridDiv, masterGridOptions);

  try {
    gridDiv.dataset.loading = "true";

    // دریافت تعهدات
    const response = await window.ApiClient.get({
      action: "listObligations"
    });

    let rawItems = [];
    if (response && response.ok && Array.isArray(response.data)) {
      rawItems = response.data;
    } else if (Array.isArray(response)) {
      rawItems = response;
    }

    gridApi.setGridOption("rowData", rawItems);

    // سطر جمع کل در پایین گرید
    const totalSum = rawItems.reduce((acc, r) => acc + (Number(r.totalAmount) || 0), 0);
    const paidSum = rawItems.reduce((acc, r) => acc + (Number(r.paidAmount) || 0), 0);
    const remSum = rawItems.reduce((acc, r) => acc + (Number(r.remainingAmount) || 0), 0);

    gridApi.setGridOption("pinnedBottomRowData", [
      {
        isSummaryRow: true,
        title: `جمع کل (${rawItems.length} تعهد)`,
        type: "",
        category: "",
        totalAmount: totalSum,
        paidAmount: paidSum,
        remainingAmount: remSum,
        installmentCount: "",
        dueDate: "",
        status: ""
      }
    ]);
  } catch (error) {
    console.error("خطا در بارگذاری لیست تعهدات:", error);
  } finally {
    gridDiv.dataset.loading = "false";
  }
}

document.addEventListener("DOMContentLoaded", initMasterDetailLazyGrid);
