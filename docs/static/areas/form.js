/**
 * project-form.js
 * مدیریت فرم ثبت و ویرایش پروژه در LifeFlow
 * معماری: Class-based + FormData (استاندارد camelCase)
 */

class AreaForm {
  constructor(formSelector = "#area-form") {
    this.form = document.querySelector(formSelector);
     // ۲. پیدا کردن المان‌های داخلی فرم (محدود به scope فرم)
    this.submitBtn = this.form.querySelector('[type="submit"]') || this.form.querySelector('#save');
    

    this.pageTitle = document.getElementById("pageTitle") || document.querySelector(".title span");
    this.typeSelect = this.form.querySelector('[name="Type"]') || this.form.querySelector("#Type");

    this.mode = "create"; // "create" | "edit"
    this.id = null;

     this.areaTypes = []; // کش محلی برای انواع

    this.bindEvents();
    this.initFromUrl();
  }

  /**
   * ثبت شنوندگان رویدادها
   */
  bindEvents() {
    if (this.submitBtn) {
      this.submitBtn.addEventListener("click", (e) => this.handleSubmit(e));
    }
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));
  }
  /**
   * بارگذاری انواع حوزه (AREA_TYPE) از شیت Lookups و پر کردن Dropdown
   */
  async loadAreaTypes() {
    debugger;
    if (!this.typeSelect) return;

    try {
      const response = await window.ApiClient1.get({
        action: "getLookupsByType",
        type: "AREA_TYPE" // نوع لوکاپ در جدول Lookups
      });

      const items = (response && response.ok && Array.isArray(response.data))
        ? response.data
        : (Array.isArray(response) ? response : (response?.data || []));

      this.areaTypes = items;

      // حفظ گزینه پیش‌فرض (انتخاب کنید...) یا پاکسازی کامل
      const firstOption = this.typeSelect.querySelector('option[value=""]');
      this.typeSelect.innerHTML = "";
      
      if (firstOption) {
        this.typeSelect.appendChild(firstOption);
      } else {
        const defaultOpt = document.createElement("option");
        defaultOpt.value = "";
        defaultOpt.textContent = "-- انتخاب نوع حوزه --";
        this.typeSelect.appendChild(defaultOpt);
      }

      // افزودن Optionها به سلکتور
      items.forEach((item) => {
        // فیلدهای کلید و عنوان با در نظر گرفتن ساختارهای مختلف
        const key = String(item.Id ?? item.Id ?? item.id ?? item.key ?? "").trim();
        const title = String(item.Title ?? item.title ?? item.title_fa ?? key).trim();
        const icon = item.Icon ?? item.icon ?? "";

        if (key) {
          const opt = document.createElement("option");
          opt.value = key;
          //opt.textContent = icon ? `${icon} ${title}` : title;
          opt.textContent =  title;
          // نگهداری داده‌های اضافی در دیتاست در صورت نیاز
          if (item.Color || item.color) opt.dataset.color = item.Color || item.color;
          
          this.typeSelect.appendChild(opt);
        }
      });

      // در صورت استفاده از Select2
      if (window.jQuery && window.jQuery(this.typeSelect).data("select2")) {
        window.jQuery(this.typeSelect).trigger("change.select2");
      }

    } catch (err) {
      console.error("[AreaForm] خطا در بارگذاری AREA_TYPE از Lookups:", err);
    }
  }
  /**
   * بررسی پارامترهای URL برای تعیین وضعیت Edit یا Create
   */
  async initFromUrl() {
        // ۱. ابتدا لود کردن لیست Typeها تا قبل از پر شدن دیتا، آپشن‌ها آماده باشند
    await this.loadAreaTypes();
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const parentId = params.get("parentId");
    const parentIdTitle = params.get("parentIdTitle");
    if (id) {
      await this.load(id);
    } else {
      this.setMode("create");
      if (parentId) {
        this.fillData({ ParentId: parentId,parentIdTitle:parentIdTitle });
      }
    }
  }

  /**
   * تنظیم حالت فرم و به‌روزرسانی عناوین UI
   */
  setMode(mode) {
    this.mode = mode === "edit" ? "edit" : "create";

    if (this.pageTitle) {
      this.pageTitle.textContent = this.mode === "edit" ? "ویرایش پروژه" : "ثبت پروژه جدید";
    }

    if (this.submitBtn) {
      const span = this.submitBtn.querySelector("span");
      if (span) {
        span.textContent = this.mode === "edit" ? "ذخیره تغییرات" : "ثبت";
      }
    }
  }
  setCheckbox(name, isChecked) {
    const el = document.querySelector(`input[name="${name}"][type="checkbox"]`);
    if (el) {
        el.checked = Boolean(isChecked);
        el.dispatchEvent(new Event('change', { bubbles: true }));
        if (window.jQuery) window.jQuery(el).trigger('change');
    }
}
  /**
   * مقداردهی خودکار فیلدها و همگام‌سازی با Select2
   */
  fillData(data = {}) {

if (data.IsActive !== undefined && data.IsActive !== null) {
    this.setCheckbox('IsActive', data.IsActive);
}
// if ('IsActive' in data) {
//     setCheckbox('IsActive', data.IsActive);
// }

    if (!data) return;

    Object.keys(data).forEach((key) => {
      // جستجوی المان با اولویت camelCase و سپس حالت‌های دیگر
      const field = this.form.elements[key] || 
                    this.form.querySelector(`[name="${key}" i]`) || 
                    this.form.querySelector(`#${key}`);

      if (!field) return;

      const value = data[key];

      if (field.type === "checkbox") {
        field.checked = Boolean(value);
      } else {
        field.value = value ?? "";
        // در صورت فعال بودن Select2 روی المان
        if (window.jQuery && window.jQuery(field).data("select2")) {
          window.jQuery(field).trigger("change");
        }
      }
    });
  }

  /**
   * استخراج داده‌های فرم با فرمت استاندارد camelCase جهت ارسال به API
   */
  getPayload() {
    const formData = new FormData(this.form);
    const activeEl = this.form.querySelector("#IsActive") || 
                     this.form.querySelector('[name="IsActive"]') || 
                     this.form.querySelector("#IsActive");
debugger;
    return {
      ...(this.mode === "edit" && this.id ? { Id: this.id } : {}),
      Title: formData.get("Title"),
      Type:formData.get("Type"),
      Description: formData.get("Description"),
      DisplayOrder: Number(formData.get("DisplayOrder")) || 0,
      IsActive: activeEl ? (activeEl.type === "checkbox" ? activeEl.checked : activeEl.value === "true") : true
    };
  }

  /**
   * لود کردن داده‌ها از سرور در حالت ویرایش
   */
  async load(id) {
    this.setMode("edit");
    this.id = id;

    try {
      this.toggleLoading(true);
      const response = await window.ApiClient1.get({
        action: "getAreaById",
        id: id
      });

      // if (!response || response.ok === false || !response.data) {
      //   throw new Error(response?.error || response?.message || "اطلاعات پروژه یافت نشد.");
      // }

      this.fillData(response);
    } catch (err) {
      console.error("[AreaForm Load Error]:", err);
      alert(err.message || "خطا در بارگذاری پروژه");
    } finally {
      this.toggleLoading(false);
    }
  }

  /**
   * ارسال داده‌های فرم به بک‌اند و آگاه‌سازی صفحه والد
   */
  async handleSubmit(e) {
    if (e) e.preventDefault();

    const payload = this.getPayload();

    if (!payload.Title) {
      alert("لطفاً عنوان پروژه را وارد نمایید.");
      const titleInput = this.form.querySelector('[name="title"]') || this.form.querySelector("#title") || this.form.querySelector("#Title");
      if (titleInput) titleInput.focus();
      return;
    }

    try {
      this.toggleLoading(true);
      const action = this.mode === "edit" ? "updateArea" : "createArea";

      const response = await window.ApiClient1.post(
        action,
        payload,
        {
          requestPrefix: "area",
          endpoint: "/areas"
        }
      );

      if (!response || response.ok === false) {
        throw new Error(response?.error || response?.message || "خطا در ثبت اطلاعات پروژه.");
      }

      // ارسال رویداد جهت رفرش دراپ‌داون‌ها و لیست‌ها در صفحه والد
      const notifyPayload = {
        type: "AREA_SAVED",
        action: this.mode,
        area: response.data || response
      };
      	displayNotification('با موفقیت انجام شد', 'success');
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(notifyPayload, "*");
      }

      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(notifyPayload, "*");
      }

    } catch (error) {
      console.error("[AreaForm Submit Error]:", error);
      alert(error.message || "خطا در ذخیره‌سازی داده‌ها.");
    } finally {
      this.toggleLoading(false);
    }
  }

  /**
   * مدیریت وضعیت دکمه در حال ارسال
   */
  toggleLoading(isLoading) {
    if (!this.submitBtn) return;
    this.submitBtn.disabled = isLoading;
    const span = this.submitBtn.querySelector("span");
    if (span) {
      if (isLoading) {
        this.submitBtn.setAttribute("data-prev-text", span.textContent);
        span.textContent = "در حال ذخیره...";
      } else {
        const prevText = this.submitBtn.getAttribute("data-prev-text");
        span.textContent = prevText || (this.mode === "edit" ? "ذخیره تغییرات" : "ثبت");
      }
    }
  }
}

// مقداردهی و نمونه‌سازی خودکار
function initAreaForm() {
  window.areaFormInstance = new AreaForm();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAreaForm);
} else {
  initAreaForm();
}
