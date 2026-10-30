/**
 * project-form.js
 * مدیریت فرم ثبت و ویرایش پروژه در LifeFlow
 * معماری: Class-based + FormData (استاندارد camelCase)
 */

class InboxItemForm {
  constructor(formSelector = "#inbox-item-form") {
    this.form = document.querySelector(formSelector);
     // ۲. پیدا کردن المان‌های داخلی فرم (محدود به scope فرم)
    this.submitBtn = this.form.querySelector('[type="submit"]') || this.form.querySelector('#save');
    

    this.pageTitle = document.getElementById("pageTitle") || document.querySelector(".title span");
    
    this.mode = "create"; // "create" | "edit"
    this.id = null;

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
   * بررسی پارامترهای URL برای تعیین وضعیت Edit یا Create
   */
  async initFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const projectId = params.get("projectId");
    const projectIdTitle = params.get("projectIdTitle");
    if (id) {
      await this.load(id);
    } else {
      this.setMode("create");
      if (projectId) {
        this.fillData({ ProjectId: projectId,ProjectIdTitle:projectIdTitle });
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
    const selectedContexts = formData.getAll("Context"); 

// ۲. تبدیل به فرمت مورد نیاز دیتابیس (تبدیل به "1, 3")
    const contextString = selectedContexts.join(","); 

debugger;
    return {
      ...(this.mode === "edit" && this.id ? { Id: this.id } : {}),
      Title: formData.get("Title"),
      //Type:formData.get("Type"),
      Description: formData.get("Description"),

      DisplayOrder: Number(formData.get("DisplayOrder")) || 0,
      IsActive: activeEl ? (activeEl.type === "checkbox" ? activeEl.checked : activeEl.value === "true") : true,
    
Note: formData.get("Description"),
       "type": 0,
  "status": 0,
  "priority": 0,
  "source": "string",
  "processedTargetId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  
    
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
        action: "getInboxItemById",
        id: id
      });

      // if (!response || response.ok === false || !response.data) {
      //   throw new Error(response?.error || response?.message || "اطلاعات پروژه یافت نشد.");
      // }

      this.fillData(response);
    } catch (err) {
      console.error("[InboxItemForm Load Error]:", err);
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
      alert("لطفاً عنوان تسک را وارد نمایید.");
      const titleInput = this.form.querySelector('[name="title"]') || this.form.querySelector("#title") || this.form.querySelector("#Title");
      if (titleInput) titleInput.focus();
      return;
    }

    try {
      this.toggleLoading(true);
      const action = this.mode === "edit" ? "updateInboxItem" : "createInboxItem";

      // const response = await window.ApiClient1.post(
      //   action,
      //   payload,
      //   {
      //     requestPrefix: "inbox-item",
      //     endpoint: "/inbox-items"
      //   }
      // );
    const response = await lifeFlow.inboxes.inboxItem.create(payload);



       if (!response || response.ok === false) {
        throw new Error(response?.error || response?.message || "خطا در ثبت اطلاعات پروژه.");
      }

// ارسال رویداد جهت رفرش دراپ‌داون‌ها و لیست‌ها در صفحه والد
      const notifyPayload = {
        type: "INBOXITEM_SAVED",
        action: this.mode,
        inboxitem: response.data || response
      };
      	displayNotification('با موفقیت انجام شد', 'success');
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(notifyPayload, "*");
      }

      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(notifyPayload, "*");
      }  

     
    } catch (error) {
      console.error("[InboxItemForm Submit Error]:", error);
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
function initInboxItemForm() {
  window.inboxItemFormInstance = new InboxItemForm();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initInboxItemForm);
} else {
  initInboxItemForm();
}
