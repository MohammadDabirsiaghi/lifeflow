/**
 * project-form.js
 * مدیریت فرم ثبت و ویرایش پروژه در LifeFlow
 * معماری: Class-based + FormData (استاندارد camelCase)
 */

class TaskForm {
  constructor(formSelector = "#task-form") {
    this.form = document.querySelector(formSelector);
     // ۲. پیدا کردن المان‌های داخلی فرم (محدود به scope فرم)
    this.submitBtn = this.form.querySelector('[type="submit"]') || this.form.querySelector('#save');
    

    this.pageTitle = document.getElementById("pageTitle") || document.querySelector(".title span");
          this.priorityIdSelect = this.form.querySelector('[name="PriorityId"]') || this.form.querySelector("#PriorityId");
      this.statusIdSelect = this.form.querySelector('[name="StatusId"]') || this.form.querySelector("#StatusId");


    this.mode = "create"; // "create" | "edit"
    this.id = null;

         this.taskPriorities = []; // کش محلی برای انواع
     this.taskStatuses = []; // کش محلی برای انواع

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
  async loadTaskPriorities() {


    try {
      const response = await window.ApiClient1.get({
        action: "getLookupsByType",
        type: "TASK_PRIORITY" // نوع لوکاپ در جدول Lookups
      });

      const items = (response && response.ok && Array.isArray(response.data))
        ? response.data
        : (Array.isArray(response) ? response : (response?.data || []));

      this.taskPriorities = items;

      // حفظ گزینه پیش‌فرض (انتخاب کنید...) یا پاکسازی کامل
      const firstOption = this.priorityIdSelect.querySelector('option[value=""]');
      this.priorityIdSelect.innerHTML = "";
      
      if (firstOption) {
        this.priorityIdSelect.appendChild(firstOption);
      } else {
        const defaultOpt = document.createElement("option");
        defaultOpt.value = "";
        defaultOpt.textContent = "-- انتخاب نوع اولویت --";
        this.priorityIdSelect.appendChild(defaultOpt);
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
          
          this.priorityIdSelect.appendChild(opt);
        }
      });

      // در صورت استفاده از Select2
      if (window.jQuery && window.jQuery(this.priorityIdSelect).data("select2")) {
        window.jQuery(this.priorityIdSelect).trigger("change.select2");
      }

    } catch (err) {
      console.error("[AreaForm] خطا در بارگذاری AREA_TYPE از Lookups:", err);
    }
  }


    async loadTaskStatuses() {


    try {
      const response = await window.ApiClient1.get({
        action: "getLookupsByType",
        type: "Task_STATUS" // نوع لوکاپ در جدول Lookups
      });

      const items = (response && response.ok && Array.isArray(response.data))
        ? response.data
        : (Array.isArray(response) ? response : (response?.data || []));

      this.taskStatuses = items;

      // حفظ گزینه پیش‌فرض (انتخاب کنید...) یا پاکسازی کامل
      const firstOption = this.statusIdSelect.querySelector('option[value=""]');
      this.statusIdSelect.innerHTML = "";
      
      if (firstOption) {
        this.statusIdSelect.appendChild(firstOption);
      } else {
        const defaultOpt = document.createElement("option");
        defaultOpt.value = "";
        defaultOpt.textContent = "-- انتخاب نوع اولویت --";
        this.statusIdSelect.appendChild(defaultOpt);
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
          
          this.statusIdSelect.appendChild(opt);
        }
      });

      // در صورت استفاده از Select2
      if (window.jQuery && window.jQuery(this.statusIdSelect).data("select2")) {
        window.jQuery(this.statusIdSelect).trigger("change.select2");
      }

    } catch (err) {
      console.error("[AreaForm] خطا در بارگذاری AREA_TYPE از Lookups:", err);
    }
  }
  /**
   * بررسی پارامترهای URL برای تعیین وضعیت Edit یا Create
   */
  async initFromUrl() {
         await this.loadTaskPriorities();
await this.loadTaskStatuses();


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


    return {
      ...(this.mode === "edit" && this.id ? { Id: this.id } : {}),
      Title: formData.get("Title"),
      ProjectId: formData.get("ProjectId") || null,
      AreaId: formData.get("AreaId") ,
      PriorityId: Number(formData.get("PriorityId")),
      StatusId: Number(formData.get("StatusId")),
      Context: contextString,
      Description: formData.get("Description"),
      DueDateShamsi: formData.get("DueDateShamsi"),
      DoneDefinition:formData.get("DoneDefinition"),
      EstimatedHours: Number(formData.get("EstimatedHours")) || 0,
      EnergyLevel: Number(formData.get("EnergyLevel")),// || window.Enums.TaskEnergyLevel.PROJECT,
      TargetPomodoros:Number(formData.get("TargetPomodoros")) || 0,
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
        action: "getTaskById",
        id: id
      });

      // if (!response || response.ok === false || !response.data) {
      //   throw new Error(response?.error || response?.message || "اطلاعات پروژه یافت نشد.");
      // }

      this.fillData(response);
    } catch (err) {
      console.error("[TaskForm Load Error]:", err);
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
      const action = this.mode === "edit" ? "updateTask" : "createTask";

      const response = await window.ApiClient1.post(
        action,
        payload,
        {
          requestPrefix: "task",
          endpoint: "/tasks"
        }
      );

      if (!response || response.ok === false) {
        throw new Error(response?.error || response?.message || "خطا در ثبت اطلاعات پروژه.");
      }
      	displayNotification('با موفقیت انجام شد', 'success');
   window.location.href = window.appUrl(`/tasks/list.html`);
      

     
    } catch (error) {
      console.error("[TaskForm Submit Error]:", error);
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
function initTaskForm() {
  window.taskFormInstance = new TaskForm();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTaskForm);
} else {
  initTaskForm();
}
