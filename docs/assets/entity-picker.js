(function ($, window) {
    'use strict';

    function getWrapper(fieldId) {
        return $('#link-builder-' + fieldId);
    }

    // مقداردهی یا پاکسازی
    window.setEntityPickerValue = function (fieldId, id, title) {
        const wrapper = getWrapper(fieldId);
        
        // به‌روزرسانی فیلد مخفی و نمایش
        wrapper.find('input.picker-value').val(id).trigger('change');
        wrapper.find('input.picker-display').val(title || '');

        // کنترل نمایش دکمه Unlink
        // const clearBtn = wrapper.find('.btn-picker-clear');
        // if (id) {
        //     clearBtn.removeClass('d-none');
        // } else {
        //     clearBtn.addClass('d-none');
        // }
    };

    // باز کردن مدال انتخابگر با استفاده از window.popup سیستم شما
    window.entityPickerOpen = function (fieldId) {
        const wrapper = getWrapper(fieldId);
        const pickerUrl = wrapper.data('picker-url');

        window.popup({
            url: pickerUrl,
            large: true,
            flex: true,
            onMessage: function (data) {
                if (data && data.type === 'ENTITY_PICKED') {
                    const { id, title } = data.data;
                    window.setEntityPickerValue(fieldId, id, title);
                    window.closePopup();
                }
            }
        });
    };

    // پاک کردن انتخاب
    window.entityPickerClear = function (fieldId) {
        window.setEntityPickerValue(fieldId, '', '');
    };

})(jQuery, window);
