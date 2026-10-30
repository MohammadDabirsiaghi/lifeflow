/**
 * /static/categories/form.js
 * مدیریت فرم ثبت و ویرایش دسته‌بندی‌های مالی در LifeFlow
 * معماری: Class-based + ABP Proxy / ApiClient
 */

class CategoryForm {
  constructor(formSelector = "#category-form") {
    this.form = document.querySelector(formSelector);
    if (!this.form) {
      console.warn(`[CategoryForm]: المان فرم با سلکتور ${formSelector} یافت نشد.`);
      return;
    }

    // المان‌های کلیدی فرم
    this.submitBtn = this.form.querySelector('[type="submit"]') || this.form.querySelector('#save');
    this.pageTitle = document.getElementById("pageTitle") || document.querySelector(".title span") || document.querySelector(".card-header h3");

    this.mode = this.form.getAttribute("data-mode") || "create"; // "create" | "edit"
    this.id = null;
    this.concurrencyStamp = null;

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
   * بررسی پارامترهای URL برای بارگذاری داده یا پرکردن مقدار اولیه والد
   */
  async initFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const parentId = params.get("parentId") || params.get("ParentId");
    const parentTitle = params.get("parentTitle") || params.get("parentIdTitle") || params.get("ParentTitle");

    if (id) {
      await this.load(id);
    } else {
      this.setMode("create");
      if (parentId) {
        this.fillData({
          ParentId: parentId,
          ParentTitle: parentTitle || ""
        });
      }
    }
  }

  /**
   * تغییر حالت فرم بین create و edit به همراه اصلاح متون UI
   */
  setMode(mode) {
    this.mode = mode === "edit" ? "edit" : "create";
    this.form.setAttribute("data-mode", this.mode);

    if (this.pageTitle) {
      this.pageTitle.textContent = this.mode === "edit" ? "ویرایش دسته‌بندی" : "ثبت دسته‌بندی جدید";
    }

    if (this.submitBtn) {
      const span = this.submitBtn.querySelector("span") || this.submitBtn;
      if (span) {
        span.textContent = this.mode === "edit" ? "ذخیره تغییرات" : "ثبت";
      }
    }
  }

  /**
   * تنظیم اختصاصی چک‌باکس‌ها
   */
  setCheckbox(name, isChecked) {
    const el = this.form.querySelector(`input[name="${name}"][type="checkbox"]`) ||
               this.form.querySelector(`#${name}[type="checkbox"]`);
    if (el) {
      el.checked = Boolean(isChecked);
      el.dispatchEvent(new Event('change', { bubbles: true }));
      if (window.jQuery) window.jQuery(el).trigger('change');
    }
  }

  /**
   * مقداردهی خودکار فیلدهای فرم با داده‌های دریافتی از سرور
   */
  fillData(data = {}) {
    if (!data) return;

    // نگهداری ConcurrencyStamp جهت ارسال در Update
    if (data.concurrencyStamp || data.ConcurrencyStamp) {
      this.concurrencyStamp = data.concurrencyStamp || data.ConcurrencyStamp;
      const csInput = this.form.querySelector('#category-concurrency-stamp') || 
                      this.form.querySelector('[name="ConcurrencyStamp"]');
      if (csInput) csInput.value = this.concurrencyStamp;
    }

    // فیلد چک‌باکس IsGroup
    const isGroupVal = data.isGroup !== undefined ? data.isGroup : data.IsGroup;
    if (isGroupVal !== undefined && isGroupVal !== null) {
      this.setCheckbox('IsGroup', isGroupVal);
    }

    // هماهنگی با کامپوننت انتخابی والد (ui/test2.html)
    const parentIdVal = data.parentId || data.ParentId;
    const parentTitleVal = data.parentTitle || data.ParentTitle || data.parentIdTitle;
    if (parentIdVal) {
      const parentInput = this.form.querySelector('[name="ParentId"]') || this.form.querySelector('#ParentId');
      if (parentInput) {
        parentInput.value = parentIdVal;
        parentInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const parentTitleInput = this.form.querySelector('#ParentId_title') || 
                               this.form.querySelector('[name="ParentTitle"]') ||
                               this.form.querySelector('#ParentTitle');
      if (parentTitleInput && parentTitleVal) {
        parentTitleInput.value = parentTitleVal;
      }
    }

    // پیمایش سایر فیلدها و مقداردهی امن
    Object.keys(data).forEach((key) => {
      if (key.toLowerCase() === 'isgroup') return;

      const field = this.form.elements[key] || 
                    this.form.querySelector(`[name="${key}" i]`) || 
                    this.form.querySelector(`#${key}`);

      if (!field) return;

      const value = data[key];

      if (field.type === "checkbox") {
        field.checked = Boolean(value);
      } else {
        field.value = value ?? "";
        if (window.jQuery && window.jQuery(field).data("select2")) {
          window.jQuery(field).trigger("change");
        }
      }
    });
  }

  /**
   * اعتبارسنجی و تبدیل فیلدها به ساختار DTO مورد نیاز ABP Backend
   */
  getPayload() {
    const formData = new FormData(this.form);

    const isGroupEl = this.form.querySelector("#IsGroup") || 
                      this.form.querySelector('[name="IsGroup"]');
    const isGroup = isGroupEl ? (isGroupEl.type === "checkbox" ? isGroupEl.checked : isGroupEl.value === "true") : false;

    const parentIdRaw = formData.get("ParentId") || this.form.querySelector('[name="ParentId"]')?.value;
    const parentId = (parentIdRaw && parentIdRaw.trim() !== "" && parentIdRaw !== "null" && parentIdRaw !== "undefined") 
      ? parentIdRaw.trim() 
      : null;

    const rawColor = formData.get("ColorHex");
    const colorHex = (rawColor && rawColor.trim() !== "") ? rawColor.trim() : null;

    const rawIcon = formData.get("Icon");
    const icon = (rawIcon && rawIcon.trim() !== "") ? rawIcon.trim() : null;

    const rawDesc = formData.get("Description");
    const description = (rawDesc && rawDesc.trim() !== "") ? rawDesc.trim() : null;

    const payload = {
      title: (formData.get("Title") || "").toString().trim(),
      transactionType: Number(formData.get("TransactionType")),
      parentId: parentId,
      icon: icon,
      colorHex: colorHex,
      isGroup: isGroup,
      displayOrder: Number(formData.get("DisplayOrder")) || 0,
      description: description
    };

    if (this.mode === "edit" && this.id) {
      payload.concurrencyStamp = this.concurrencyStamp || formData.get("ConcurrencyStamp") || "";
    }

    return payload;
  }

  /**
   * دریافت اطلاعات رکورد در حالت ویرایش
   */
  async load(id) {
    this.setMode("edit");
    this.id = id;

    const idInput = this.form.querySelector("#category-id") || this.form.querySelector('[name="Id"]');
    if (idInput) idInput.value = id;

    try {
      this.toggleLoading(true);

      let response;
      
        response = await lifeFlow.finance.category.get(id);
     
      const categoryData = response?.data || response;
      this.fillData(categoryData);

    } catch (err) {
      console.error("[CategoryForm Load Error]:", err);
      if (typeof displayNotification === "function") {
        displayNotification(err.message || "خطا در بارگذاری اطلاعات دسته‌بندی", "error");
      } else {
        alert(err.message || "خطا در بارگذاری اطلاعات دسته‌بندی");
      }
    } finally {
      this.toggleLoading(false);
    }
  }

  /**
   * ارسال داده‌ها به سرور (Create / Update)
   */
  async handleSubmit(e) {
    if (e) e.preventDefault();

    const payload = this.getPayload();

    // ولیدیشن اولیه کلاینت
    if (!payload.title) {
      if (typeof displayNotification === "function") {
        displayNotification("لطفاً عنوان دسته‌بندی را وارد نمایید.", "warning");
      } else {
        alert("لطفاً عنوان دسته‌بندی را وارد نمایید.");
      }
      const titleInput = this.form.querySelector('[name="Title"]') || this.form.querySelector("#Title");
      if (titleInput) titleInput.focus();
      return;
    }

    if (!payload.transactionType || isNaN(payload.transactionType) || payload.transactionType <= 0) {
      if (typeof displayNotification === "function") {
        displayNotification("لطفاً نوع تراکنش (هزینه، درآمد، انتقال) را انتخاب نمایید.", "warning");
      } else {
        alert("لطفاً نوع تراکنش را مشخص نمایید.");
      }
      const typeSelect = this.form.querySelector('[name="TransactionType"]');
      if (typeSelect) typeSelect.focus();
      return;
    }

    try {
      this.toggleLoading(true);
      let response;

     
        if (this.mode === "edit") {
          response = await lifeFlow.finance.category.update(this.id, payload);
        } else {
          response = await lifeFlow.finance.category.create(payload);
        }
      
     
      
      if (response && response.ok === false) {
        throw new Error(response?.error || response?.message || "خطا در ثبت اطلاعات دسته‌بندی.");
      }

      const resultData = response?.data || response;

      if (typeof displayNotification === "function") {
        displayNotification(this.mode === "edit" ? "تغییرات با موفقیت ذخیره شد." : "دسته‌بندی با موفقیت ایجاد شد.", "success");
      }

      // اطلاع‌رسانی به والد/مودال (Refresh گرید و درخت دسته‌بندی‌ها)
      const notifyPayload = {
        type: "CATEGORY_SAVED",
        action: this.mode,
        category: resultData
      };

      if (window.parent && window.parent !== window) {
        window.parent.postMessage(notifyPayload, "*");
      }

      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(notifyPayload, "*");
      }

      // بستن خودکار پاپ‌آپ در صورت نیاز
      setTimeout(() => {
        if (window.parent && window.parent.closeModal) {
          window.parent.closeModal();
        }
      }, 700);

    } catch (error) {
      console.error("[CategoryForm Submit Error]:", error);
      const errMsg = error?.responseJSON?.error?.message || error?.message || "خطا در ذخیره‌سازی داده‌ها.";
      if (typeof displayNotification === "function") {
        displayNotification(errMsg, "error");
      } else {
        alert(errMsg);
      }
    } finally {
      this.toggleLoading(false);
    }
  }

  /**
   * وضعیت لودینگ و متن دکمه ارسال
   */
  toggleLoading(isLoading) {
    if (!this.submitBtn) return;
    this.submitBtn.disabled = isLoading;
    const span = this.submitBtn.querySelector("span") || this.submitBtn;
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

// اینیشالایز خودکار بعد از آماده‌شدن DOM
function initCategoryForm() {
  window.categoryFormInstance = new CategoryForm("#category-form");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCategoryForm);
} else {
  initCategoryForm();
}
