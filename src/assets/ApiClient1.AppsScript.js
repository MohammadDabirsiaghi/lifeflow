/**
 * LifeFlow Google Apps Script Provider
 */
"use strict";

(function () {
    if (!window.ApiClient1) {
        console.error("ApiClient1 Core باید قبل از فایل های Provider لود شود.");
        return;
    }

    function getBaseUrl() {
        const config = window.ApiClient1.getConfig();
        const url = config.API_URL;
        if (!url) {
            throw new Error("آدرس API_URL مربوط به Apps Script در config.js تنظیم نشده است.");
        }
        return url;
    }

    async function get(params, options) {
        const baseUrl = getBaseUrl();
        const config = window.ApiClient1.getConfig();

        return new Promise((resolve, reject) => {
            const callbackName = "__apiCallback_" + Date.now() + "_" + Math.random().toString(36).slice(2);
            const script = document.createElement("script");
            const query = new URLSearchParams({
                ...params,
                callback: callbackName,
                _: Date.now()
            });

            const timeoutMs = Number(options.timeoutMs || config.API_TIMEOUT_MS || 30000);
            let timeoutId;

            function cleanup() {
                clearTimeout(timeoutId);
                script.remove();
                try {
                    delete window[callbackName];
                } catch {
                    window[callbackName] = undefined;
                }
            }

            window[callbackName] = function (result) {
                cleanup();
                try {
                    resolve(window.ApiClient1.normalizeApiResult(result));
                } catch (error) {
                    reject(error);
                }
            };

            script.onerror = function () {
                cleanup();
                reject(new Error("ارتباط با سرور Apps Script برقرار نشد."));
            };

            timeoutId = setTimeout(function () {
                cleanup();
                reject(new Error("زمان دریافت پاسخ از Apps Script به پایان رسید."));
            }, timeoutMs);

            script.src = baseUrl + "?" + query.toString();
            document.body.appendChild(script);
        });
    }

    async function postRaw(action, data, requestId) {
        const baseUrl = getBaseUrl();
        try {
            await fetch(baseUrl, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({ ...data, action, requestId })
            });

            return { ok: true, pending: true, status: "pending", requestId };
        } catch {
            throw new Error("ارسال داده به Apps Script ناموفق بود. اتصال اینترنت را بررسی کنید.");
        }
    }

    async function pollRequest(requestId, options) {
        const config = window.ApiClient1.getConfig();
        const intervalMs = Math.max(300, Number(options.intervalMs || config.POLLING?.INTERVAL_MS || 1000));
        const maxAttempts = Math.max(1, Number(options.maxAttempts || config.POLLING?.MAX_ATTEMPTS || 20));

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            const response = await get({ action: "getRequestStatus", requestId }, { provider: "apps-script" });
            const statusData = response?.data || {};
            const status = String(statusData.status || "").toLowerCase();

            if (status === "done") {
                return window.ApiClient1.normalizeApiResult(statusData.result ?? statusData);
            }
            if (status === "failed" || status === "error") {
                throw window.ApiClient1.createApiError(statusData.result || statusData, statusData.message || "پردازش ناموفق بود.");
            }
            if (status === "invalid") {
                throw new Error(statusData.message || "وضعیت درخواست نامعتبر است.");
            }
            if (status === "not_found" && attempt >= 3) {
                throw new Error(statusData.message || "درخواست پیدا نشد یا منقضی شده است.");
            }

            if (attempt < maxAttempts) {
                await window.ApiClient1.delay(intervalMs);
            }
        }

        return {
            ok: true,
            pending: true,
            status: "pending",
            requestId,
            message: "درخواست همچنان در حال پردازش است."
        };
    }

    async function send(httpMethod, action, data, options) {
        const requestId = options.requestId || window.ApiClient1.createRequestId(options.requestPrefix || "req");
        await postRaw(action, data, requestId);
        return pollRequest(requestId, options);
    }

    // ثبت پرووایدر در کلاینت اصلی
    window.ApiClient1.registerProvider("apps-script", {
        get,
        send
    });
})();
