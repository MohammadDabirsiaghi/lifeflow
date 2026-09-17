"use strict";

(function () {
    function getConfig() {
        const config = window.APP_CONFIG1 || window.APP_CONFIG1 || {};

        if (!config.API_URL) {
            throw new Error("آدرس API در config.js تنظیم نشده است.");
        }

        return config;
    }

    function getProvider() {
        return String(getConfig().API_PROVIDER || "apps-script").toLowerCase();
    }

    function createRequestId(prefix) {
        const normalizedPrefix =
            String(prefix || "req").trim().replace(/[^a-zA-Z0-9_-]/g, "") || "req";

        if (window.crypto && typeof window.crypto.randomUUID === "function") {
            return normalizedPrefix + "_" + window.crypto.randomUUID();
        }

        return (
            normalizedPrefix +
            "_" +
            Date.now() +
            "_" +
            Math.random().toString(36).slice(2, 10)
        );
    }

    function delay(milliseconds) {
        return new Promise(function (resolve) {
            setTimeout(resolve, milliseconds);
        });
    }

    function normalizeApiResult(result) {
        if (!result || typeof result !== "object") {
            throw new Error("پاسخ دریافت‌شده از سرور معتبر نیست.");
        }

        if (result.ok === false) {
            throw createApiError(result);
        }

        return result;
    }

    function createApiError(result, fallbackMessage) {
        const error = new Error(
            result?.message || fallbackMessage || "عملیات ناموفق بود."
        );
        error.name = "ApiError";
        error.status = result?.status || 0;
        error.code = result?.code || "";
        error.errors = result?.errors || null;
        error.response = result;
        return error;
    }

    // ==========================================
    // بخش GET (در Apps Script با JSONP و در ASP.NET با fetch)
    // ==========================================
    async function get(params, options) {
        debugger;
        params = params || {};
        options = options || {};
        const provider = options.provider || getProvider();
        const config = getConfig();

        if (provider === "apps-script") {
            return new Promise(function (resolve, reject) {
                const callbackName =
                    "__apiCallback_" +
                    Date.now() +
                    "_" +
                    Math.random().toString(36).slice(2);

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
                        resolve(normalizeApiResult(result));
                    } catch (error) {
                        reject(error);
                    }
                };

                script.onerror = function () {
                    cleanup();
                    reject(new Error("ارتباط با سرور برقرار نشد."));
                };

                timeoutId = setTimeout(function () {
                    cleanup();
                    reject(new Error("زمان دریافت پاسخ از سرور تمام شد."));
                }, timeoutMs);

                script.src = config.API_URL + "?" + query.toString();
                document.body.appendChild(script);
            });
        }

        if (provider === "aspnet") {
            debugger;
            // در ASP.NET یا endpoint مشخص است یا از action خوانده می‌شود
            const endpoint = options.endpoint || (params.action ? "/" + params.action : "");
            const url = new URL(
                config.API_URL_ASPNET.replace(/\/+$/, "") + "/" + endpoint.replace(/^\/+/, "")
            );

            // اضافه کردن پارامترها به query string
            Object.keys(params).forEach(key => {
                if (params[key] !== undefined && params[key] !== null) {
                    url.searchParams.append(key, params[key]);
                }
            });

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || config.API_TIMEOUT_MS || 30000);

            try {
                const response = await fetch(url.toString(), {
                    method: "GET",
                    mode: "cors",
                    headers: { "Accept": "application/json" },
                    signal: controller.signal
                });
                const result = await response.json();
                if (!response.ok) throw createApiError({ ...result, status: response.status });
                return normalizeApiResult(result);
            } catch (err) {
                if (err.name === "AbortError") throw new Error("زمان درخواست به پایان رسید.");
                throw err;
            } finally {
                clearTimeout(timeoutId);
            }
        }

        throw new Error("API_PROVIDER معتبر نیست: " + provider);
    }

    // ==========================================
    // توابع داخلی Apps Script
    // ==========================================
    async function appsScriptPostRaw(action, data, requestId) {
        const config = getConfig();
        console.log(config);
        try {
       await fetch(config.API_URL, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({
                    ...data,       // داده‌ها اول قرار می‌گیرند تا مقادیر زیر بازنویسی نشوند
                    action,
                    requestId
                })
            });

             return { ok: true, pending: true, status: "pending", requestId };
        } catch (error) {
            throw new Error("ارسال درخواست ناموفق بود. اتصال اینترنت را بررسی کنید.");
        }

      
    }

    async function pollAppsScriptRequest(requestId, options) {
        options = options || {};
        const config = getConfig();
        const intervalMs = Math.max(300, Number(options.intervalMs || config.POLLING?.INTERVAL_MS || 1000));
        const maxAttempts = Math.max(1, Number(options.maxAttempts || config.POLLING?.MAX_ATTEMPTS || 20));

        for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
            debugger;
            const response = await get({ action: "getRequestStatus", requestId });
            const statusData = response?.data || {};
            const status = String(statusData.status || "").toLowerCase();

            if (status === "done") {
                return normalizeApiResult(statusData.result || statusData);
            }

            if (status === "failed" || status === "error") {
                throw createApiError(
                    statusData.result || statusData,
                    statusData.message || "پردازش درخواست ناموفق بود."
                );
            }

            if (status === "invalid") {
                throw new Error(statusData.message || "وضعیت درخواست معتبر نیست.");
            }

            if (status === "not_found" && attempt >= 3) {
                throw new Error(statusData.message || "وضعیت درخواست پیدا نشد یا منقضی شده است.");
            }

            if (attempt < maxAttempts) {
                await delay(intervalMs);
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

    // ==========================================
    // توابع کمکی ASP.NET
    // ==========================================
    function resolveAspNetEndpoint(action, options) {
        if (options.endpoint) return options.endpoint;

        const routes = {
            createAccount: "/accounts",
            updateAccount: "/accounts",
            deleteAccount: "/accounts",
            restoreAccount: "/accounts",

            createParticipant: "/participants",
            updateParticipant: "/participants",
            deleteParticipant: "/participants"
        };

        const endpoint = routes[action];
        if (!endpoint) {
            throw new Error("مسیر ASP.NET Core برای Action زیر تعریف نشده است: " + action);
        }
        return endpoint;
    }

    function resolveAspNetMethod(action, defaultMethod, options) {
        if (options.method) return String(options.method).toUpperCase();
        if (defaultMethod) return defaultMethod.toUpperCase();

        if (action.startsWith("create")) return "POST";
        if (action.startsWith("update")) return "PUT";
        if (action.startsWith("delete")) return "DELETE";
        if (action.startsWith("restore")) return "POST";

        return "POST";
    }

    function buildAspNetUrl(baseUrl, endpoint, action, data) {
        let path = endpoint;
        const isUpdateOrDelete = action.startsWith("update") || action.startsWith("delete");

        if (isUpdateOrDelete && data && data.id) {
            path += "/" + encodeURIComponent(data.id);
        } else if (action.startsWith("restore") && data && data.id) {
            path += "/" + encodeURIComponent(data.id) + "/restore";
        }

        return baseUrl.replace(/\/+$/, "") + "/" + path.replace(/^\/+/, "");
    }

    // ==========================================
    // متد اصلی ارسال تغییرات (POST / PUT / DELETE)
    // ==========================================
    async function sendRequest(httpMethod, actionOrPayload, maybeData, maybeOptions) {
        let action = "";
        let data = {};
        let options = {};

        // پشتیبانی از هر دو حالت فراخوانی:
        // ۱. ApiClient.post("createAccount", data, options)
        // ۲. ApiClient.post({ action: "createAccount", data: ..., options: ... })
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

        const provider = getProvider();

        // -------------------------
        // مسیر Apps Script
        // -------------------------
        if (provider === "apps-script") {
            const requestId = options.requestId || createRequestId(options.requestPrefix || "req");
             try {
                await appsScriptPostRaw(action, data, requestId);
          
                return pollAppsScriptRequest(requestId, options);
             } catch (error) {
                 console.log(error);
                throw error;
              }
              finally {
      
            }
          
        }

        // -------------------------
        // مسیر ASP.NET Core
        // -------------------------
        if (provider === "aspnet") {
            const config = getConfig();
            const requestId = options.requestId || createRequestId(options.requestPrefix || "req");
            const endpoint = resolveAspNetEndpoint(action, options);
            const method = resolveAspNetMethod(action, httpMethod, options);
            const url = buildAspNetUrl(config.API_URL, endpoint, action, data);

            const controller = new AbortController();
            const timeoutMs = Number(options.timeoutMs || config.API_TIMEOUT_MS || 30000);
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

            try {
                const headers = {
                    "Accept": "application/json",
                    "X-Request-Id": requestId
                };

                const fetchOptions = {
                    method,
                    mode: "cors",
                    credentials: options.credentials || "omit",
                    headers,
                    signal: controller.signal
                };

                if (method !== "GET" && method !== "DELETE") {
                    headers["Content-Type"] = "application/json";
                    fetchOptions.body = JSON.stringify({ ...data, requestId });
                }

                const response = await fetch(url, fetchOptions);
                let result = null;

                try {
                    result = await response.json();
                } catch {
                    result = {
                        ok: response.ok,
                        message: response.ok ? "عملیات با موفقیت انجام شد." : "پاسخ سرور نامعتبر است."
                    };
                }

                if (!response.ok) {
                    throw createApiError({ ...result, status: response.status }, "عملیات ناموفق بود.");
                }

                if (response.status === 202 || result?.pending === true) {
                    // در صورت نیاز به Polling برای کارهای سنگین در ASP.NET
                    throw new Error("Job پس‌زمینه در ASP.NET نیاز به پیگیری دارد.");
                }

                return normalizeApiResult(result);
            } catch (error) {
                if (error.name === "AbortError") throw new Error("زمان انجام درخواست تمام شد.");
                throw error;
            } finally {
                clearTimeout(timeoutId);
            }
        }

        throw new Error("API_PROVIDER معتبر نیست: " + provider);
    }

    // میان‌برهای CRUD
    async function post(action, data, options) {
        return sendRequest("POST", action, data, options);
    }

    async function put(action, data, options) {
        return sendRequest("PUT", action, data, options);
    }

    async function del(action, data, options) {
        return sendRequest("DELETE", action, data, options);
    }

    // ==========================================
    // شیء سراسری و عمومی
    // ==========================================
    window.ApiClient1 = Object.freeze({
        get,
        post,
        put,
        delete: del,
        execute: post, // جهت سازگاری به عقب اگر جایی execute صدا زده شده باشد
        createRequestId
    });
})();
