/* Jalali date/time input helpers. The API boundary always uses an ISO UTC instant. */
(function (global) {
  "use strict";

  const preferenceKey = "lifeflow.timeZone";
  const persianFormatter = new Intl.DateTimeFormat("en-US-u-ca-persian-nu-latn", {
    timeZone: "UTC", year: "numeric", month: "numeric", day: "numeric"
  });

  function partsMap(formatter, date) {
    return Object.fromEntries(formatter.formatToParts(date).map(part => [part.type, part.value]));
  }

  function normalizeDigits(value) {
    return String(value).replace(/[\u06F0-\u06F9\u0660-\u0669]/g, digit => {
      const code = digit.charCodeAt(0);
      return String(code >= 0x06F0 ? code - 0x06F0 : code - 0x0660);
    });
  }

  function jalaliToGregorian(year, month, day) {
    // Use the browser's Intl Persian calendar data instead of embedding a second calendar implementation.
    const cacheKey = `${year}/${month}/${day}`;
    if (jalaliToGregorian.cache.has(cacheKey)) return jalaliToGregorian.cache.get(cacheKey);

    const start = Date.UTC(year + 621, 0, 1);
    for (let offset = 0; offset < 740; offset++) {
      const date = new Date(start + offset * 86400000);
      const parts = partsMap(persianFormatter, date);
      if (Number(parts.year) === year && Number(parts.month) === month && Number(parts.day) === day) {
        const gregorian = { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
        jalaliToGregorian.cache.set(cacheKey, gregorian);
        return gregorian;
      }
    }
    throw new Error("تاریخ شمسی واردشده معتبر نیست.");
  }
  jalaliToGregorian.cache = new Map();

  function parseJalaliDateTime(value) {
    const normalized = normalizeDigits(value).trim();
    const match = normalized.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})\s+(\d{1,2}):(\d{2})$/);
    if (!match) throw new Error("تاریخ را به شکل سال/ماه/روز ساعت:دقیقه وارد کنید.");

    const [, y, m, d, h, min] = match.map(Number);
    if (m < 1 || m > 12 || d < 1 || d > 31 || h > 23 || min > 59) {
      throw new Error("تاریخ یا ساعت واردشده معتبر نیست.");
    }
    return { ...jalaliToGregorian(y, m, d), hour: h, minute: min };
  }

  function gregorianPartsInZone(instant, timeZone) {
    const formatter = new Intl.DateTimeFormat("en-US-u-ca-gregory-nu-latn", {
      timeZone, year: "numeric", month: "numeric", day: "numeric",
      hour: "numeric", minute: "numeric", second: "numeric", hourCycle: "h23"
    });
    const parts = partsMap(formatter, new Date(instant));
    return {
      year: Number(parts.year), month: Number(parts.month), day: Number(parts.day),
      hour: Number(parts.hour), minute: Number(parts.minute), second: Number(parts.second)
    };
  }

  function toUtcIso(value, timeZone) {
    const local = parseJalaliDateTime(value);
    const wallClockAsUtc = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute);
    let instant = wallClockAsUtc;

    for (let attempt = 0; attempt < 4; attempt++) {
      const zoned = gregorianPartsInZone(instant, timeZone);
      const offset = Date.UTC(zoned.year, zoned.month - 1, zoned.day, zoned.hour, zoned.minute, zoned.second) - instant;
      const next = wallClockAsUtc - offset;
      if (next === instant) break;
      instant = next;
    }

    const result = gregorianPartsInZone(instant, timeZone);
    if (result.year !== local.year || result.month !== local.month || result.day !== local.day ||
        result.hour !== local.hour || result.minute !== local.minute) {
      throw new Error("این ساعت در منطقهٔ زمانی انتخاب‌شده وجود ندارد. ساعت دیگری انتخاب کنید.");
    }
    return new Date(instant).toISOString();
  }

  function formatJalali(iso, timeZone, includeTime = true) {
    if (!iso) return "—";
    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      timeZone,
      year: "numeric", month: "2-digit", day: "2-digit",
      ...(includeTime ? { hour: "2-digit", minute: "2-digit", hourCycle: "h23" } : {})
    }).format(new Date(iso));
  }

  function toJalaliInput(iso, timeZone) {
    const date = new Date(iso);
    const dateParts = partsMap(new Intl.DateTimeFormat("en-US-u-ca-persian-nu-latn", {
      timeZone, year: "numeric", month: "2-digit", day: "2-digit"
    }), date);
    const timeParts = partsMap(new Intl.DateTimeFormat("en-US-u-ca-gregory-nu-latn", {
      timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }), date);
    return `${dateParts.year}/${String(dateParts.month).padStart(2, "0")}/${String(dateParts.day).padStart(2, "0")} ${timeParts.hour}:${timeParts.minute}`;
  }

  function getTimeZone() {
    const saved = localStorage.getItem(preferenceKey);
    if (saved) {
      try { new Intl.DateTimeFormat("en", { timeZone: saved }); return saved; } catch (_) { }
    }
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  }

  function setTimeZone(value) {
    new Intl.DateTimeFormat("en", { timeZone: value });
    localStorage.setItem(preferenceKey, value);
  }

  global.LifeFlowDateTime = { formatJalali, getTimeZone, jalaliToGregorian, parseJalaliDateTime, setTimeZone, toJalaliInput, toUtcIso };
})(window);
