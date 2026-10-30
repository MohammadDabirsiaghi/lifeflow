/**
 * account-form.js
 * مدیریت فرم ثبت و ویرایش حساب‌ها در LifeFlow (سازگار با ABP.io و متد Create/Update)
 * معماری: Class-based + FormData (استاندارد camelCase)
 */

class AccountForm {
  constructor(formSelector = "#account-form") {
    this.form = document.querySelector(formSelector);
    if (!this.form) return;

    // پیدا کردن دکمه ذخیره داخل فرم یا خارج از آن
    this.submitBtn = this.form.querySelector('[type="submit"]') || document.querySelector('#save, #submit-btn');
    this.pageTitle = document.getElementById("pageTitle") || document.querySelector(".title span, h1");
    
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

    // شنود رویداد دریافت ParentId از Modal Picker (در صورت استفاده از ui/test2.html)
    window.addEventListener("message", (event) => {
      if (event.data && event.data.type === "ENTITY_PICKED") {
        this.setParentAccount(event.data.data);
      }
    });
  }

  /**
   * بررسی پارامترهای URL برای تعیین وضعیت Edit یا Create و مقداردهی اولیه والد
   */
  async initFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const parentId = params.get("parentId");
    const parentIdTitle = params.get("parentIdTitle");

    if (id) {
      await this.load(id);
    } else {
      this.setMode("create");
      if (parentId) {
        this.fillData({ 
          ParentId: parentId, 
          ParentIdTitle: parentIdTitle || "" 
        });
        
        // اگر کامپوننت Picker نمایشگر عنوان دارد، آن را به‌روز کن
        const parentTitleEl = document.querySelector("#ParentId_title, [data-picker-title='ParentId']");
        if (parentTitleEl) parentTitleEl.textContent = parentIdTitle;
      }
    }
  }

  /**
   * تنظیم حالت فرم (Create یا Edit) و متن عناوین UI
   */
  setMode(mode) {
    this.mode = mode === "edit" ? "edit" : "create";

    if (this.pageTitle) {
      this.pageTitle.textContent = this.mode === "edit" ? "ویرایش حساب" : "ثبت حساب جدید";
    }

    if (this.submitBtn) {
      const span = this.submitBtn.querySelector("span") || this.submitBtn;
      span.textContent = this.mode === "edit" ? "ذخیره تغییرات" : "ثبت حساب";
    }
  }

  /**
   * تنظیم مقدار چک‌باکس با رویدادهای تغییرات
   */
  setCheckbox(name, isChecked) {
    const el = this.form.querySelector(`input[name="${name}"][type="checkbox"]`);
    if (el) {
      el.checked = Boolean(isChecked);
      el.dispatchEvent(new Event('change', { bubbles: true }));
      if (window.jQuery) window.jQuery(el).trigger('change');
    }
  }

  /**
   * تنظیم والد انتخاب‌شده از طریق مودال
   */
  setParentAccount(data) {
    const parentIdInput = this.form.querySelector('[name="ParentId"]');
    const parentTitleDisplay = this.form.querySelector('#ParentId_title, [data-picker-text="ParentId"]');
    
    if (parentIdInput) parentIdInput.value = data.id;
    if (parentTitleDisplay) parentTitleDisplay.textContent = data.title;
  }

  /**
   * مقداردهی خودکار فیلدهای فرم از آبجکت داده دریافتی
   */
  fillData(data = {}) {
    if (!data) return;

    if (data.IsActive !== undefined && data.IsActive !== null) {
      this.setCheckbox('IsActive', data.IsActive);
    }
    if (data.IsGroup !== undefined && data.IsGroup !== null) {
      this.setCheckbox('IsGroup', data.IsGroup);
    }
    if (data.IncludeInNetWorth !== undefined && data.IncludeInNetWorth !== null) {
      this.setCheckbox('IncludeInNetWorth', data.IncludeInNetWorth);
    }

    Object.keys(data).forEach((key) => {
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
   * استخراج داده‌های فرم با ساختار استاندارد مطابق با CreateAccountDto در ABP.io
   */
  getPayload() {
    const formData = new FormData(this.form);
    
    const getVal = (name) => formData.get(name);
    const getNum = (name) => Number(formData.get(name)) || 0;
    const getBool = (name) => {
      const el = this.form.querySelector(`[name="${name}"]`);
      return el ? (el.type === "checkbox" ? el.checked : el.value === "true") : false;
    };

    return {
      ...(this.mode === "edit" && this.id ? { Id: this.id } : {}),
      Title: getVal("Title")?.trim(),
      ParentId: getVal("ParentId") || null,
      
      // Enums و تنظیمات اصلی
      AccountType: getNum("AccountType"),
      UsageIntent: getNum("UsageIntent"),
      SubAccountMode: getNum("SubAccountMode") || 1,
      OwnershipType: getNum("OwnershipType") || 1,
      InstitutionName: getVal("InstitutionName")?.trim() || "",
      
      IsGroup: getBool("IsGroup"),
      IsActive: getBool("IsActive"),
      IncludeInNetWorth: getBool("IncludeInNetWorth"),

      // مشخصات بانکی
      AccountNumber: getVal("AccountNumber") || null,
      Iban: getVal("Iban") || null,
      CardNumber: getVal("CardNumber") || null,
      AltCardNumbers: getVal("AltCardNumbers") || null,
      SmsOriginator: getVal("SmsOriginator") || null,

      // موجودی‌ها و اعتبارات
      InitialBalance: getNum("InitialBalance"),
      CreditLimit: getNum("CreditLimit"),
      BlockedAmount: getNum("BlockedAmount"),
      UnclearedBalance: getNum("UnclearedBalance"),
      MinimumAlertBalance: getVal("MinimumAlertBalance") ? Number(getVal("MinimumAlertBalance")) : null,

      // مالیات و چک
      IsCommercial: getBool("IsCommercial"),
      TaxFileNumber: getVal("TaxFileNumber") || null,
      HasCheckbook: getBool("HasCheckbook"),
      CheckbookSeries: getVal("CheckbookSeries") || null,

      // سود و تنظیمات ظاهری
      InterestRatePercentage: getVal("InterestRatePercentage") ? Number(getVal("InterestRatePercentage")) : null,
      InterestPayoutDay: getVal("InterestPayoutDay") ? Number(getVal("InterestPayoutDay")) : null,
      Currency: getVal("Currency") || "IRR",
      ColorHex: getVal("ColorHex") || "#0d6efd",
      Icon: getVal("Icon") || "bi-wallet2",
      DisplayOrder: getNum("DisplayOrder")
    };
  }

  /**
   * بارگذاری داده‌های حساب در حالت ویرایش از طریق پراکسی ABP
   */
  async load(id) {
    this.setMode("edit");
    this.id = id;

    try {
      this.toggleLoading(true);
      
      // استفاده از متد استاندارد سرویس ABP (یا ApiClient متناسب با پروژه شما)
      let response;
      if (window.lifeFlow && window.lifeFlow.finance && window.lifeFlow.finance.accounts) {
        response = await window.lifeFlow.finance.accounts.get(id);
      } else if (window.ApiClient1) {
        response = await window.ApiClient1.get({ action: "getAccountById", id: id });
      } else {
        throw new Error.Default("سرویس ارتباط با سرور یافت نشد.");
      }

      const accountData = response?.data || response;
      this.fillData(accountData);

    } catch (err) {
      console.error("[AccountForm Load Error]:", err);
      alert(err.message || "خطا در بارگذاری اطلاعات حساب");
    } finally {
      this.toggleLoading(false);
    }
  }

  /**
   * ارسال داده‌های فرم به بک‌اند ABP.io و اطلاع‌رسانی به پنجره والد
   */
  async handleSubmit(e) {
    if (e) e.preventDefault();

    const payload = this.getPayload();

    if (!payload.Title) {
      alert("لطفاً عنوان حساب را وارد نمایید.");
      const titleInput = this.form.querySelector('[name="Title"]');
      if (titleInput) titleInput.focus();
      return;
    }

    try {
      this.toggleLoading(true);
debugger;
      let response;
     
        if (this.mode === "edit") {
          response = await lifeFlow.finance.account.create (this.id, payload);
        } else {
          response = await lifeFlow.finance.account.create (payload);
        }
    
     

      const savedData = response?.data || response;

      // اطلاع‌رسانی به پنل/پنجره والد (برای به‌روزرسانی درختی یا گرید)
      const notifyPayload = {
        type: "ACCOUNT_SAVED",
        action: this.mode,
        account: savedData
      };

      if (typeof displayNotification === "function") {
        displayNotification('حساب با موفقیت ذخیره شد', 'success');
      } else {
        console.log("حساب با موفقیت ذخیره شد");
      }

      if (window.parent && window.parent !== window) {
        window.parent.postMessage(notifyPayload, "*");
      }

      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(notifyPayload, "*");
        window.close();
      }

    } catch (error) {
      console.error("[AccountForm Submit Error]:", error);
      alert(error.message || "خطا در ذخیره‌سازی اطلاعات حساب.");
    } finally {
      this.toggleLoading(false);
    }
  }

  /**
   * مدیریت حالت بارگذاری دکمه ثبت
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

// مقداردهی اولیه خودکار
function initAccountForm() {
  if (document.querySelector("#account-form")) {
    window.accountFormInstance = new AccountForm();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAccountForm);
} else {
  initAccountForm();
}
