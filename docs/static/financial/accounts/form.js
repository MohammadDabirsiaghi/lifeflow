/**
 * account-form.js
 * مدیریت یکپارچه فرم‌های ایجاد و ویرایش حساب (LifeFlow)
 */

(function () {
  "use strict";

  let currentMode = "create"; // "create" | "edit"
  let currentId = null;

  // کش کردن المان‌های DOM
  const form = document.getElementById("accountForm") || document.querySelector("form");
  const pageTitle = document.getElementById("pageTitle") || document.querySelector(".page-title");
  const submitBtn = document.getElementById("btnSubmit") || document.querySelector("button[type='submit']");
  const cancelBtn = document.getElementById("btnCancel") || document.querySelector(".btn-cancel, .js-btn-cancel");

  // پیدا کردن المان‌ها با id یا name
  function getField(name) {
    return document.getElementById(name) || document.querySelector(`[name='${name}']`);
  }

  const fields = {
    Id: () => getField("Id"),
    Name: () => getField("Name"),
    ParentId: () => getField("ParentId"),
    Description: () => getField("Description"),
    DisplayOrder: () => getField("DisplayOrder"),
    IsActive: () => getField("IsActive")
  };

  /**
   * تنظیم حالت فرم (Create یا Edit)
   * @param {'create' | 'edit'} mode 
   */
  function setFormMode(mode) {
    currentMode = mode === "edit" ? "edit" : "create";

    if (pageTitle) {
      pageTitle.textContent = currentMode === "edit" ? "ویرایش حساب" : "افزودن حساب جدید";
    }

    if (submitBtn) {
      submitBtn.textContent = currentMode === "edit" ? "ذخیره تغییرات" : "ایجاد حساب";
    }
  }

  /**
   * مقداردهی به فیلدهای فرم
   * @param {Object} data 
   */
  function setFormData(data = {}) {
    if (!data) return;

    if (data.id !== undefined) {
      currentId = data.id;
      const el = fields.id();
      if (el) el.value = data.id;
    }

    if (data.title !== undefined) {
      const el = fields.title();
      if (el) el.value = data.title || "";
    }

    if (data.parent_id !== undefined) {
      const el = fields.parent_id();
      if (el) el.value = data.parent_id || "";
    }

    if (data.description !== undefined) {
      const el = fields.description();
      if (el) el.value = data.description || "";
    }

    if (data.display_order !== undefined) {
      const el = fields.display_order();
      if (el) el.value = data.display_order ?? 0;
    }

    if (data.is_active !== undefined) {
      const el = fields.is_active();
      if (el) {
        if (el.type === "checkbox") {
          el.checked = Boolean(data.is_active);
        } else {
          el.value = data.is_active;
        }
      }
    }
  }

  /**
   * خواندن داده‌های ورودی از فرم
   */
  function getFormData() {
    const titleEl = fields.title();
    const parentEl = fields.parent_id();
    const descEl = fields.description();
    const orderEl = fields.display_order();
    const activeEl = fields.is_active();
    const idEl = fields.id();

    const idVal = currentId || (idEl ? idEl.value : null);

    return {
      ...(currentMode === "edit" && idVal ? { id: idVal } : {}),
      title: titleEl ? titleEl.value.trim() : "",
      parent_id: parentEl && parentEl.value ? parentEl.value : "",
      description: descEl ? descEl.value.trim() : "",
      display_order: orderEl ? Number(orderEl.value) || 0 : 0,
      is_active: activeEl ? (activeEl.type === "checkbox" ? activeEl.checked : activeEl.value === "true" || activeEl.value === "1") : true
    };
  }

  /**
   * دریافت اطلاعات حساب از سرور در حالت Edit
   * @param {string|number} id 
   */
  async function loadAccountForEdit(id) {
    if (!id) {
      alert("شناسه حساب مشخص نیست.");
      return;
    }

    setFormMode("edit");

    try {
      if (submitBtn) submitBtn.disabled = true;

      const response = await window.ApiClient1.get({
        action: "getAccount",
        id: id
      });

      if (!response || response.ok === false || !response.data) {
        throw new Error(response?.error || response?.message || "حساب پیدا نشد.");
      }

      setFormData(response.data);
    } catch (err) {
      console.error("loadAccountForEdit error:", err);
      alert(err.message || "خطا در بارگذاری حساب");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }
 /**
   * ارسال رویداد به پنجره والد (پشتیبانی از iframe و opener)
   */
  function notifyParent(data) {
    const payload = {
      type: "ACCOUNT_SAVED",
      action: currentMode,
      data: data
    };

    // اگر داخل iframe باشد (حالت modal-popup-shared)
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(payload, "*");
    }

    // اگر با window.open باز شده باشد
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(payload, "*");
    }
  }

  /**
   * ارسال فرم (Create یا Update)
   */
  async function handleSubmit(event) {
    if (event) event.preventDefault();

    const payload = getFormData();

    if (!payload.title) {
      alert("لطفاً عنوان حساب را وارد نمایید.");
      fields.title()?.focus();
      return;
    }

    const originalBtnText = submitBtn ? submitBtn.innerHTML : "";

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = "در حال ذخیره...";
      }

      const action = currentMode === "edit" ? "updateAccount" : "createAccount";
   const response =await window.ApiClient1.post(
           action, 
            payload, 
            {
                requestPrefix: "account",
                endpoint: "/accounts" // مسیر آماده برای مهاجرت آینده به ASP.NET Core
            }
        );

      if (!response || response.ok === false) {
        throw new Error(response?.error || response?.message || "خطا در ثبت اطلاعات حساب.");
      }
      // ارسال پیام به والد برای رفرش گرید
   const payload1 = {
        type: 'ACCOUNT_SAVED',
        action:  'edit' ,
        account: response
    };

    // فقط پیام را به والد شلیک می‌کنیم
    if (window.parent && window.parent !== window) {
        window.parent.postMessage(payload1, '*');
    }
    //   // ارسال پیام رفرش به گرید والد
    //   if (window.opener && !window.opener.closed) {
    //     window.opener.postMessage({ type: "ACCOUNT_SAVED", action: currentMode, data: payload }, "*");
    //   }

    //   alert(currentMode === "edit" ? "حساب با موفقیت ویرایش شد." : "حساب با موفقیت ایجاد شد.");
    //   window.close();

    } catch (error) {
      console.error("Submit Error:", error);
      alert(error.message || "خطا در ذخیره‌سازی داده‌ها.");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    }
  }

  /**
   * بررسی URL و مقداردهی اولیه به صورت خودکار
   */
  async function autoInit() {
    // ثبت رویدادهای سابمیت و انصراف
    if (form) form.addEventListener("submit", handleSubmit);
    if (cancelBtn) {
      cancelBtn.addEventListener("click", (e) => {
        e.preventDefault();
        window.close();
      });
    }

    // خواندن پارامترهای آدرس
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const parentId = params.get("parent_id") || "";

    if (id) {
      // اگر id در آدرس بود -> حالت Edit
      await loadAccountForEdit(id);
    } else {
      // در غیر این صورت -> حالت Create
      setFormMode("create");
      if (parentId) {
        setFormData({ parent_id: parentId });
      }
    }
  }

  // اکسپورت API برای مواقع خاصی که دسترسی مستقیم نیاز باشد
  window.accountFormApi = {
    setFormMode,
    setFormData,
    getFormData,
    loadAccountForEdit,
    submit: handleSubmit
  };

  // اجرا به محض لود شدن DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInit);
  } else {
    autoInit();
  }
})();
