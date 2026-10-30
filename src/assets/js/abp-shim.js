// abp-shim.js: شبیه‌ساز سبک ABP بدون نیاز به jQuery
window.abp = window.abp || {};

// ۱. تنظیم آدرس پایه بک‌اند
abp.appPath = 'https://localhost:44305/'; // یا پورت backend خودتان

// ۲. شبیه‌ساز ابزارهای متنی و ساخت namespace
abp.utils = abp.utils || {
    createNamespace: function (root, ns) {
        var parts = ns.split('.');
        for (var i = 0; i < parts.length; i++) {
            root[parts[i]] = root[parts[i]] || {};
            root = root[parts[i]];
        }
        return root;
    },
    buildQueryString: function (params) {
        if (!params || !params.length) return '';
        var qs = params
            .filter(function (p) { return p.value !== undefined && p.value !== null && p.value !== ''; })
            .map(function (p) { return encodeURIComponent(p.name) + '=' + encodeURIComponent(p.value); })
            .join('&');
        return qs ? '?' + qs : '';
    }
};

// ۳. جایگزین $.extend جی‌کوئری برای ادغام تنظیمات
window.$ = window.$ || {};
window.$.extend = function (deep) {
    var target = {};
    var start = (typeof deep === 'boolean') ? 1 : 0;
    for (var i = start; i < arguments.length; i++) {
        var source = arguments[i] || {};
        for (var prop in source) {
            if (Object.prototype.hasOwnProperty.call(source, prop)) {
                target[prop] = source[prop];
            }
        }
    }
    return target;
};

// ۴. پیاده‌سازی متد abp.ajax با Fetch بومی مرورگر (همراه Promise)
abp.ajax = function (options) {
    var method = (options.type || 'GET').toUpperCase();
    var url = options.url.startsWith('http') ? options.url : abp.appPath + options.url.replace(/^\//, '');

    var headers = Object.assign({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }, options.headers || {});

    // اگر توکن Auth ذخیره کرده‌اید:
    var token = localStorage.getItem('lifeFlow_auth_token');
    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }

    var fetchConfig = {
        method: method,
        headers: headers
    };

    if (options.data && method !== 'GET') {
        fetchConfig.body = typeof options.data === 'string' ? options.data : JSON.stringify(options.data);
    }

    return fetch(url, fetchConfig)
        .then(function (response) {
            if (!response.ok) {
                return response.json().catch(function () {
                    throw new Error('HTTP Error ' + response.status);
                }).then(function (errBody) {
                    throw errBody;
                });
            }
            if (response.status === 204 || options.dataType === null) {
                return null;
            }
            return response.json();
        });
};
