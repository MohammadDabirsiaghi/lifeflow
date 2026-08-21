async function initTrafficFinesGrid() {
    const gridDiv = document.querySelector("#myGrid");

    if (!gridDiv) return;

    // اگر کلید لایسنس داری:
    // agGrid.LicenseManager.setLicenseKey("YOUR_LICENSE_KEY");

    const parseAmount = (val) => {
        if (val === null || val === undefined || val === "") return 0;
        const num = Number(String(val).replaceAll(",", ""));
        return Number.isNaN(num) ? 0 : num;
    };

    const currencyFormatter = (params) => {
        if (
            params.value === null ||
            params.value === undefined ||
            params.value === ""
        ) {
            return "—";
        }

        const amount = parseAmount(params.value);
        return `${amount.toLocaleString("fa-IR")} تومان`;
    };

    const dateTimeFormatter = (params) => {
        // برای ردیف جمع کل فرمت اعمال نشود
        if (params.node && params.node.footer) return "";
        if (!params.value) return "—";

        const date = new Date(params.value);
        if (Number.isNaN(date.getTime())) return params.value;

        return new Intl.DateTimeFormat("fa-IR", {
            dateStyle: "short",
            timeStyle: "short"
        }).format(date);
    };

    const statusCellClassRules = {
        "status-paid": params => !params.node.footer && params.value === "پرداخت شده",
        "status-unpaid": params => !params.node.footer && params.value === "پرداخت نشده",
        "status-pending": params => !params.node.footer && params.value === "در انتظار پرداخت"
    };

    const gridOptions = {
        enableRtl: true,
        animateRows: true,
        loading: true,

        // 🌟 ویژگی Enterprise: فعال‌سازی ردیف جمع کل در انتهای جدول
        grandTotalRow: "bottom",

        columnDefs: [
            {
                field: "id",
                headerName: "شناسه",
                width: 110,
                pinned: "right",
                sortable: true,
                filter: "agNumberColumnFilter",
                // نمایش عنوان "جمع کل" در ردیف فوتر
                valueGetter: params => {
                    if (params.node && params.node.footer) {
                        return "جمع کل";
                    }
                    return params.data ? params.data.id : "";
                },
                cellClassRules: {
                    "fw-bold text-primary": params => params.node.footer
                }
            },
            {
                field: "time",
                headerName: "زمان",
                width: 130,
                sortable: true,
                filter: "agTextColumnFilter",
                // 🌟 Enterprise: شمارش تعداد موارد
                aggFunc: "count",
                valueFormatter: params => {
                    if (params.node && params.node.footer) {
                        return `${(params.value || 0).toLocaleString("fa-IR")} مورد`;
                    }
                    return params.value || "—";
                },
                cellClassRules: {
                    "text-muted small": params => params.node.footer
                }
            },
            {
                field: "amount",
                headerName: "مبلغ",
                width: 180,
                sortable: true,
                filter: "agNumberColumnFilter",
                // 🌟 Enterprise: جمع زدن خودکار تمام مقادیر ستون
                aggFunc: "sum",
                valueFormatter: currencyFormatter,
                cellClassRules: {
                    "fw-bold text-success": params => params.node.footer
                }
            },
            {
                field: "violationType",
                headerName: "نوع تخلف",
                minWidth: 180,
                flex: 1,
                filter: "agTextColumnFilter",
                enableRowGroup: true // قابلیت Drag & Drop برای گروه‌بندی (Enterprise)
            },
            {
                field: "violationLocation",
                headerName: "محل تخلف",
                minWidth: 240,
                flex: 1.5,
                filter: "agTextColumnFilter",
                enableRowGroup: true
            },
            {
                field: "registrationMethod",
                headerName: "نحوه ثبت تخلف",
                minWidth: 170,
                flex: 1,
                filter: "agTextColumnFilter",
                enableRowGroup: true
            },
            {
                field: "updatedAt",
                headerName: "تاریخ به‌روزرسانی",
                minWidth: 190,
                valueFormatter: dateTimeFormatter,
                sortable: true,
                filter: "agDateColumnFilter"
            },
            {
                field: "status",
                headerName: "وضعیت",
                width: 160,
                cellClassRules: statusCellClassRules,
                sortable: true,
                filter: "agTextColumnFilter",
                enableRowGroup: true
            },
            {
                field: "paymentReferenceNumber",
                headerName: "شماره مرجع پرداختی",
                minWidth: 220,
                flex: 1,
                valueFormatter: params => {
                    if (params.node && params.node.footer) return "";
                    return params.value || "—";
                },
                filter: "agTextColumnFilter"
            }
        ],

        defaultColDef: {
            resizable: true,
            sortable: true,
            filter: true,
            floatingFilter: true
        },

        // امکانات تکمیلی Enterprise (اختیاری و بسیار کاربردی):
        sideBar: true, // سایدبار ابزارها و فیلترها
        enableCharts: true, // قابلیت رسم نمودار از جدول
        enableRangeSelection: true, // انتخاب سلول‌ها مانند اکسل

        pagination: true,
        paginationPageSize: 25,
        paginationPageSizeSelector: [10, 25, 50, 100],

        rowSelection: {
            mode: "multiRow"
        },

        overlayNoRowsTemplate: `
            <span class="text-muted">هیچ جریمه‌ای ثبت نشده است</span>
        `
    };

    const gridApi = agGrid.createGrid(gridDiv, gridOptions);

    try {
        gridApi.setGridOption("loading", true);

        const response = await window.ApiClient.get({
            action: "listTrafficFines"
        });

        let rawItems = [];

        if (response && response.ok && Array.isArray(response.data)) {
            rawItems = response.data;
        } else if (Array.isArray(response)) {
            rawItems = response;
        } else {
            throw new Error("ساختار پاسخ API معتبر نیست");
        }

        const normalizedItems = rawItems.map(item => ({
            id: item.id ?? item["id"],
            time: item.time ?? item["زمان"],
            amount: parseAmount(item.amount ?? item["مبلغ"]),
            violationType:
                item.violationType ?? item.type ?? item["نوع"],
            violationLocation:
                item.violationLocation ?? item["محل تخلف"],
            registrationMethod:
                item.registrationMethod ?? item["نحوه ثبت تخلف"],
            updatedAt:
                item.updatedAt ?? item["تاریخ به روز رسانی"],
            status: item.status ?? item["وضعیت"],
            paymentReferenceNumber:
                item.paymentReferenceNumber ?? item.paymentReference ?? item["شماره مرجع پرداختی"]
        }));

        gridApi.setGridOption("rowData", normalizedItems);
    } catch (error) {
        console.error("خطا در بارگذاری جرایم رانندگی:", error);
        gridApi.setGridOption("rowData", []);
        gridApi.showNoRowsOverlay();
    } finally {
        gridApi.setGridOption("loading", false);
    }
}

document.addEventListener(
    "DOMContentLoaded",
    initTrafficFinesGrid
);
