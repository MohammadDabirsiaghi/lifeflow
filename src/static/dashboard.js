document.addEventListener("DOMContentLoaded", async () => {
    initCharts();
    await loadDashboardSummary();
});

function parseAmount(val) {
    if (!val) return 0;
    const num = Number(String(val).replaceAll(",", ""));
    return Number.isNaN(num) ? 0 : num;
}

async function loadDashboardSummary() {
    try {
        // ۱. دریافت داده‌های جرایم از API شیت
        const finesResponse = await window.ApiClient.get({ action: "listTrafficFines" });
        const fines = Array.isArray(finesResponse?.data) ? finesResponse.data : (Array.isArray(finesResponse) ? finesResponse : []);

        const unpaidFines = fines.filter(f => f.status === "پرداخت نشده" || f["وضعیت"] === "پرداخت نشده");
        const totalUnpaidAmount = unpaidFines.reduce((sum, item) => sum + parseAmount(item.amount ?? item["مبلغ"]), 0);

        // ۲. به‌روزرسانی KPI جرایم
        document.getElementById("kpiUnpaidFinesAmount").textContent = `${totalUnpaidAmount.toLocaleString("fa-IR")} تومان`;
        document.getElementById("kpiUnpaidFinesCount").textContent = `${unpaidFines.length.toLocaleString("fa-IR")} مورد`;

        // ۳. پر کردن جدول مینی‌مال جرایم پرداخت‌نشده
        const tbody = document.getElementById("unpaidFinesTableBody");
        if (unpaidFines.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center text-success py-3">هیچ جریمه پرداخت‌نشده‌ای وجود ندارد 🎉</td></tr>`;
        } else {
            tbody.innerHTML = unpaidFines.slice(0, 4).map(item => `
                <tr>
                    <td><strong>${item.violationType || item.type || item["نوع"] || "—"}</strong></td>
                    <td class="text-secondary small">${item.violationLocation || item["محل تخلف"] || "—"}</td>
                    <td class="text-danger fw-bold">${parseAmount(item.amount ?? item["مبلغ"]).toLocaleString("fa-IR")} ت</td>
                    <td>
                        <a href="/traffic-fines.html" class="btn btn-sm btn-ghost-primary">پرداخت</a>
                    </td>
                </tr>
            `).join("");
        }

        // ۴. مقداردهی سایر KPIها (در صورت وجود اندپوینت‌های مربوطه)
        document.getElementById("kpiTotalIncome").textContent = "۳۸,۴۵۰,۰۰۰ تومان";
        document.getElementById("kpiSnappIncome").textContent = "۱۴,۲۰۰,۰۰۰ تومان";
        document.getElementById("kpiSnappRides").textContent = "۸۶ سفر ثبت شده";
        document.getElementById("kpiTotalExpense").textContent = "۱۹,۱۰۰,۰۰۰ تومان";

    } catch (error) {
        console.error("خطا در بارگذاری اطلاعات داشبورد:", error);
    }
}

function initCharts() {
    // نمودار میله‌ای جریان نقدی
    const cashFlowOptions = {
        series: [{
            name: 'درآمد',
            data: [28, 32, 30, 35, 42, 38]
        }, {
            name: 'هزینه',
            data: [15, 18, 17, 22, 20, 19]
        }],
        chart: {
            type: 'bar',
            height: 280,
            toolbar: { show: false },
            fontFamily: 'inherit'
        },
        colors: ['#2fb344', '#d63939'],
        plotOptions: {
            bar: { borderRadius: 4, columnWidth: '55%' }
        },
        xaxis: {
            categories: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور']
        },
        yaxis: {
            labels: { formatter: (val) => `${val} م` }
        }
    };
    new ApexCharts(document.querySelector("#chart-income-expense"), cashFlowOptions).render();

    // نمودار سهم هزینه‌ها
    const expenseOptions = {
        series: [45, 25, 20, 10],
        labels: ['استهلاک و بنزین', 'شخصی و منزل', 'ابزارها و سرور', 'سایر'],
        chart: {
            type: 'donut',
            height: 280,
            fontFamily: 'inherit'
        },
        colors: ['#206bc4', '#4299e1', '#f59f00', '#74b816']
    };
    new ApexCharts(document.querySelector("#chart-expense-categories"), expenseOptions).render();
}
