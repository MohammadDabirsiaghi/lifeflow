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
                width: 210,
                sortable: true,
            },
            {
                field: "title",
                headerName: "عنوان",
                width: 210,
                sortable: true,
            },
            {
                field: "startDate",
                headerName: "تاریخ شروع",
                width: 210,
                sortable: true,
            },
            {
                field: "startDateShamsi",
                headerName: "تاریخ شروع شمسی",
                width: 210,
                sortable: true,
            },
            {
                field: "endDate",
                headerName: "تاریخ پایان",
                width: 210,
                sortable: true,
            },
            {
                field: "endDateShamsi",
                headerName: "تاریخ پایان شمسی",
                width: 210,
                sortable: true,
            },
        ],

        defaultColDef: {
            resizable: true,
            sortable: true,
            filter: true,
            floatingFilter: false
        },

        // امکانات تکمیلی Enterprise (اختیاری و بسیار کاربردی):
        sideBar: false, // سایدبار ابزارها و فیلترها
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

        const data = await window.ApiClient1.get({
            action: "getSprintList"
        });

        // let rawItems = [];

        // if (response && response.ok && Array.isArray(response.data)) {
        //     rawItems = response.data;
        // } else if (Array.isArray(response)) {
        //     rawItems = response;
        // } else {
        //     throw new Error("ساختار پاسخ API معتبر نیست");
        // }
        gridApi.setGridOption("rowData", Array.isArray(data) ? data : []);
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
