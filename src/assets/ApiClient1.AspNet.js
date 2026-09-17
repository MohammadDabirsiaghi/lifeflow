/**
 * LifeFlow ASP.NET Core (ABP.io) Provider
 */
"use strict";

(function () {
    if (!window.ApiClient1) {
        console.error("ApiClient1 Core باید قبل از فایل های Provider لود شود.");
        return;
    }

    function getBaseUrl() {
        const config = window.ApiClient1.getConfig();
        const url = config.API_URL_ASPNET || config.API_URL;
        if (!url) {
            throw new Error("آدرس API_URL_ASPNET در config.js تنظیم نشده است.");
        }
        return url;
    }

    function buildUrl(baseUrl, endpoint) {
        return baseUrl.replace(/\/+$/, "") + "/" + String(endpoint || "").replace(/^\/+/, "");
    }

    function resolveEndpoint(action, options) {
        if (options?.endpoint) return options.endpoint;
        if (String(action).includes("/")) return "/" + String(action).replace(/^\/+/, "");

        const routes = {
            createAccount: "/accounts",
            updateAccount: "/accounts",
            deleteAccount: "/accounts",
            restoreAccount: "/accounts",
            createParticipant: "/participants",
            updateParticipant: "/participants",
            deleteParticipant: "/participants"
        };
        return routes[action] || "/" + action;
    }

    function resolveMethod(action, requestedMethod, options) {
        if (options?.method) return String(options.method).toUpperCase();
        if (requestedMethod) return String(requestedMethod).toUpperCase();

        if (action.startsWith("create") || action.startsWith("add")) return "POST";
        if (action.startsWith("update") || action.startsWith("edit")) return "PUT";
        if (action.startsWith("delete") || action.startsWith("remove")) return "DELETE";
        if (action.startsWith("restore")) return "POST";
        return "POST";
    }

    function buildRequestPath(baseUrl, endpoint, action, data) {
        let path = endpoint;
        const isUpdateOrDelete = action.startsWith("update") || action.startsWith("delete");

        if (isUpdateOrDelete && data && data.id !== undefined && data.id !== null) {
            path += "/" + encodeURIComponent(data.id);
        } else if (action.startsWith("restore") && data && data.id !== undefined && data.id !== null) {
            path += "/" + encodeURIComponent(data.id) + "/restore";
        }
        return buildUrl(baseUrl, path);
    }

    async function readBody(response) {
        if (response.status === 204) return null;
        const text = await response.text();
        if (!text.trim()) return null;
        try {
            return JSON.parse(text);
        } catch {
            return text;
        }
    }

    async function get(params, options) {
        const baseUrl = getBaseUrl();
        const config = window.ApiClient1.getConfig();

        const endpoint = options.endpoint || (params.action ? "/" + params.action : "");
        if (!endpoint) {
            throw new Error("پارامتر action یا endpoint برای فراخوانی GET در ASP.NET الزامی است.");
        }

        const url = new URL(buildUrl(baseUrl, endpoint));
        Object.keys(params).forEach((key) => {
            if (key !== "action" && params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });

        const controller = new AbortController();
        const timeoutMs = Number(options.timeoutMs || config.API_TIMEOUT_MS || 30000);
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(url.toString(), {
                method: "GET",
                mode: "cors",
                credentials: options.credentials || "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    ...(options.headers || {})
                },
                signal: controller.signal
            });

            const result = await readBody(response);

            if (!response.ok) {
                throw window.ApiClient1.createApiError(
                    { ...(result && typeof result === "object" ? result : {}), status: response.status },
                    "دریافت اطلاعات از سرور ناموفق بود."
                );
            }

            return window.ApiClient1.normalizeApiResult(result);
        } catch (error) {
            if (error.name === "AbortError") throw new Error("زمان درخواست به پایان رسید.");
            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    async function send(httpMethod, action, data, options) {
        const baseUrl = getBaseUrl();
        const config = window.ApiClient1.getConfig();
        const requestId = options.requestId || window.ApiClient1.createRequestId(options.requestPrefix || "req");

        const endpoint = resolveEndpoint(action, options);
        const method = resolveMethod(action, httpMethod, options);
        const url = buildRequestPath(baseUrl, endpoint, action, data);

        const controller = new AbortController();
        const timeoutMs = Number(options.timeoutMs || config.API_TIMEOUT_MS || 30000);
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const headers = {
                Accept: "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "X-Request-Id": requestId,
                ...(options.headers || {})
            };

            const fetchOptions = {
                method,
                mode: "cors",
                credentials: options.credentials || "include",
                headers,
                signal: controller.signal
            };

            if (method !== "GET" && method !== "DELETE") {
                headers["Content-Type"] = "application/json";
                fetchOptions.body = JSON.stringify(data);
            }

            const response = await fetch(url, fetchOptions);
            const result = await readBody(response);

            if (!response.ok) {
                throw window.ApiClient1.createApiError(
                    { ...(result && typeof result === "object" ? result : {}), status: response.status },
                    "عملیات در سرور ناموفق بود."
                );
            }

            return window.ApiClient1.normalizeApiResult(result);
        } catch (error) {
            if (error.name === "AbortError") throw new Error("زمان انجام درخواست به پایان رسید.");
            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    // ثبت پرووایدر در کلاینت اصلی
    window.ApiClient1.registerProvider("aspnet", {
        get,
        send
    });
})();
