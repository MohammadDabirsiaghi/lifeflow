/**
 * LifeFlow API Client Core
 * Core orchestrator supporting pluggable providers (AppsScript, AspNet, Supabase, etc.)
 */
"use strict";

(function () {
    const providers = {};

    function getConfig() {
        return window.APP_CONFIG1 || {};
    }

    function getDefaultProviderName() {
        return String(getConfig().API_PROVIDER || "apps-script").toLowerCase();
    }

    function registerProvider(name, implementation) {
        if (!name || typeof implementation !== "object") {
            throw new Error("نام و بدنه پیاده‌سازی Provider الزامی است.");
        }
        providers[String(name).toLowerCase()] = implementation;
    }

    function getProviderInstance(providerName) {
        const name = String(providerName || getDefaultProviderName()).toLowerCase();
        const provider = providers[name];
        if (!provider) {
            throw new Error(`پرووایدر '${name}' ثبت نشده یا فایل آن لود نشده است.`);
        }
        return provider;
    }

    function createRequestId(prefix) {
        const cleanPrefix = String(prefix || "req").trim().replace(/[^a-zA-Z0-9_-]/g, "") || "req";
        if (window.crypto && typeof window.crypto.randomUUID === "function") {
            return cleanPrefix + "_" + window.crypto.randomUUID();
        }
        return cleanPrefix + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
    }

    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function createApiError(result, fallbackMessage) {
        let msg = fallbackMessage || "عملیات ناموفق بود.";

        if (result && typeof result === "object") {
            const abpErr = result.error;
            if (abpErr) {
                if (Array.isArray(abpErr.validationErrors) && abpErr.validationErrors.length > 0) {
                    msg = abpErr.validationErrors.map(e => e.message).filter(Boolean).join(" | ");
                } else {
                    msg = abpErr.message || abpErr.details || msg;
                }
            } else if (result.message) {
                msg = result.message;
            }
        }

        const error = new Error(msg);
        error.name = "ApiError";
        error.status = result?.status ?? 0;
        error.code = result?.error?.code || result?.code || "";
        error.details = result?.error?.details || result?.details || "";
        error.validationErrors = result?.error?.validationErrors || result?.validationErrors || null;
        error.response = result;
        return error;
    }

[    function normalizeApiResultOld(result) {
        if (result && typeof result === "object") {
            if (result.ok === false || result.error) {
                throw createApiError(result);
            }
            if (result.ok === true && Object.prototype.hasOwnProperty.call(result, "data")) {
                return result;
            }
        }
        return {
            ok: true,
            data: result ?? null
        };
    }]
    function normalizeApiResult(result) {
        if (!result && result !== false && result !== 0) {
            return null;
        }

        if (typeof result === "object") {
            // مدیریت خطاها (اگر ABP یا سرور ارور برگرداند)
            if (result.error || result.ok === false) {
                throw createApiError(result);
            }

            // اگر خروجی لیستی ABP باشد ({ items: [...], totalCount: ... })
            if (Array.isArray(result.items)) {
                return result.items;
            }
        }

        // بازگرداندن مستقیم خود دیتای خالص (آرایه یا آبجکت)
        return result;
    }
    // Facade Methods
    async function get(params, options) {
        options = options || {};
        const provider = getProviderInstance(options.provider);
        return provider.get(params || {}, options);
    }

    async function sendRequest(httpMethod, actionOrPayload, maybeData, maybeOptions) {
        let action = "";
        let data = {};
        let options = {};

        if (typeof actionOrPayload === "string") {
            action = actionOrPayload;
            data = maybeData || {};
            options = maybeOptions || {};
        } else if (typeof actionOrPayload === "object" && actionOrPayload !== null) {
            action = actionOrPayload.action || "";
            data = actionOrPayload.data || actionOrPayload.payload || {};
            options = actionOrPayload.options || {};
        }

        if (!action) {
            throw new Error("پارامتر action برای ارسال درخواست الزامی است.");
        }

        const provider = getProviderInstance(options.provider);
        return provider.send(httpMethod, action, data, options);
    }

    const ApiClient1 = Object.freeze({
        // ثبت پرووایدرها
        registerProvider,
        // ابزارهای مشترک
        createRequestId,
        createApiError,
        normalizeApiResult,
        delay,
        getConfig,
        // متدهای فراخوانی عمومی
        get,
        post: (action, data, options) => sendRequest("POST", action, data, options),
        put: (action, data, options) => sendRequest("PUT", action, data, options),
        delete: (action, data, options) => sendRequest("DELETE", action, data, options),
        execute: (action, data, options) => sendRequest("POST", action, data, options)
    });

    window.ApiClient1 = ApiClient1;
})();
