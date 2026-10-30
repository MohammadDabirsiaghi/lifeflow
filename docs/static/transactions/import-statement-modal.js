/**
 * LifeFlow - Bank Statement Import Modal Script (ABP Proxy Integrated)
 */
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('import-statement-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const fileInput = document.getElementById('statement-file-input');
        const accountIdInput = form.querySelector('input[name="ImportAccountId"]');
        const submitBtn = document.getElementById('btn-submit-import');
        const spinner = document.getElementById('import-spinner');

        // ۱. اعتبارسنجی فرانت‌اند
        if (!accountIdInput || !accountIdInput.value) {
            abp.message.warn('لطفاً حساب بانکی مقصد را انتخاب نمایید.');
            return;
        }

        if (!fileInput.files || fileInput.files.length === 0) {
            abp.message.warn('لطفاً فایل صورت‌حساب را انتخاب کنید.');
            return;
        }

        // ۲. آماده‌سازی FormData برای فایل و فیلدهای ورودی
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        formData.append('accountId', accountIdInput.value);
        formData.append('bankFormat', document.getElementById('statement-bank-type').value);
        formData.append('skipDuplicates', document.getElementById('skip-duplicates').checked);

        // فعال‌سازی حالت لودینگ
        submitBtn.disabled = true;
        spinner.classList.remove('d-none');
// ۲. فراخوانی پراکسی
abp.ui.setBusy('#ImportStatementForm');
        // ۳. فراخوانی از طریق پراکسی ABP
        // نکته: متد سرویس شما در Application Service (مثلاً StatementImportAppService.UploadAsync)
        // پراکسی تولیدشده در مسیر abp.services.app.statementImport.upload قرار می‌گیرد.
      lifeFlow.controllers.transactionImport.upload(formData)
    .done(function (result) {
        abp.notify.success(
            `ایمپورت با موفقیت انجام شد. کل سطور: ${result.totalRows}، ثبت‌شده: ${result.importedCount}، ردشده (تکراری): ${result.skippedCount}`
        );

        // ارسال پیام برای رفرش گرید صفحه اصلی و بستن مدال
        window.postMessage({ action: 'statement-imported' }, '*');
        closePopup(); // یا متد بستن مدال شما
    })
    .fail(function (error) {
        abp.ajax.handleError(error);
    })
    .always(function () {
        abp.ui.clearBusy('#ImportStatementForm');
    });

        //     // ارسال پیام به پنجره والد جهت رفرش لیست
        //     const targetWindow = window.opener || window.parent;
        //     if (targetWindow && typeof targetWindow.postMessage === 'function') {
        //         targetWindow.postMessage({
        //             type: 'STATEMENT_IMPORTED',
        //             count: result?.importedCount
        //         }, '*');
        //     }

        //     // بستن پنجره پاپ‌آپ
        //     if (typeof window.closePopup === 'function') {
        //         window.closePopup();
        //     }
        // }).always(function () {
        //     submitBtn.disabled = false;
        //     spinner.classList.add('d-none');
        // });
    });
});
