"use strict";

window.APP_CONFIG = Object.freeze({
    API_URL:
        "https://script.google.com/macros/s/AKfycbyZm2JQbHTSEBmSUhYYBTToAj5H_toJnAKppIm8wn8uWchlabFJqxnz9Hh9tXAyZ9_Otg/exec"
});

// https://script.google.com/macros/s/AKfycbykl_pfchi6YsUe_5ybA7jEhc9AW633Zds_BJj-DxNSihZ3o5a7mT3TNbaSZHT2c6XAIw/exec
window.APP_CONFIG1 = Object.freeze({
    API_URL:
        "https://script.google.com/macros/s/AKfycbyNjlg0ygyvvDe0Xy7b_1LnxAF-m857qiO-J5CnVWgVFbzY5ifBR0ttCFtaMMEGPZyh6g/exec",
    API_URL_ASPNET:
        "https://localhost:44305/api",
    API_PROVIDER: "apps-script",

    API_TIMEOUT_MS: 30000,

    POLLING: {
        INTERVAL_MS: 1000,
        MAX_ATTEMPTS: 20
    }
});
// {
//   "ok": true,
//   "data": {
//     "id": "0e21c34a-d913-4670-9943-a890bf30d980",
//     "title": "بانک ملت"
//   },
//   "message": "حساب با موفقیت ثبت شد."
// }

// {
//   "ok": false,
//   "message": "عنوان حساب الزامی است.",
//   "errors": {
//     "title": [
//       "عنوان حساب الزامی است."
//     ]
//   }
// }
// {
//   "ok": true,
//   "pending": true,
//   "status": "pending",
//   "requestId": "account_1756042123456_abc123",
//   "statusUrl": "/api/requests/account_1756042123456_abc123",
//   "message": "درخواست پذیرفته شد."
// }

