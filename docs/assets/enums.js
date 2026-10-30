/**
 * enums.js
 * تعریف تمام مقادیر ثابت و Enumهای سامانه LifeFlow
 */

const Enums = Object.freeze({
  // نوع پروژه
  ProjectType: Object.freeze({
    CATEGORY: 1,  // سرشاخه / دسته‌بندی
    PROJECT: 2    // پروژه اجرایی
  }),

  // وضعیت تسک‌ها / پروژه‌ها (اگر دارید)
  ProjectStatus: Object.freeze({
    PENDING: 1,
    IN_PROGRESS: 2,
    COMPLETED: 3,
    ARCHIVED: 4
  }),

  // نوع تراکنش‌های مالی (در صورت وجود)
  TransactionType: Object.freeze({
    INCOME: 1,
    EXPENSE: 2
  })
});

// در دسترس قرار دادن در سطح سراسری (Window)
window.Enums = Enums;
