/**
 * static/transactions/form.js
 * مدیریت فرم ایجاد / ویرایش تراکنش مالی و اقلام تفصیلی با AG Grid Enterprise
 */

class TransactionForm {
    constructor(formSelector = "#transaction-form") {
        this.form = document.querySelector(formSelector);
        if (!this.form) return;

        // فیلدهای اصلی فرم
        this.idInput = document.getElementById("transaction-id");
this.activeItemRowNodeForCategory = null; // نگهداری ردیفی که کاربر روی دکمه انتخاب دسته‌اش کلیک کرده

         
        this.typeSelect = this.form.querySelector('#Type');

        this.targetAccountRow = this.form.querySelector('#target-account-col');

        this.amountInput =this.form.querySelector('#Amount'); 
        this.persianDateInput =this.form.querySelector('#PersianDate') ;
        this.counterpartyInput =this.form.querySelector('#Counterparty') ;
        this.userNoteInput =this.form.querySelector('#UserNote') ;
        this.unitPriceInput =this.form.querySelector('#UnitPrice') ;
        this.quantityInput =this.form.querySelector('#Quantity') ;
        this.unitSelect = this.form.querySelector('#Unit');


        this.submitBtn = document.getElementById("btn-submit");
        this.spinner = this.submitBtn?.querySelector(".spinner-border");

        // سلکتورهای پایه
        this.accountSelect = this.form.querySelector('#AccountId');
        //this.targetAccountSelect = document.getElementById("transaction-target-account-id");
        this.categorySelect =this.form.querySelector('#CategoryId');
        this.contactSelect =this.form.querySelector('#ContactId');

        // اقلام و گرید
        this.itemsGridElement = document.getElementById("transactionItemsGrid");
        this.btnAddItem = document.getElementById("btn-add-item");
        this.btnRemoveSelectedItems = document.getElementById("btn-remove-selected-items");

// سوئیچ و کانتینر اقلام
this.hasItemsToggle = document.getElementById("toggle-has-items");
this.itemsContainer = document.getElementById("items-card-container");


        this.itemsGridApi = null;
        this.mode = "create";
        this.categoriesList = [];

        this.init();
    }

    async init() {
        this.initItemsGrid();
        this.initEventListeners();
        await this.loadLookups();
        this.initFromUrl();
    }

    /* -------------------------------------------------------------
       ۱. راه‌اندازی و کانفیگ AG Grid Enterprise
    ------------------------------------------------------------- */
    initItemsGrid() {
        if (!this.itemsGridElement || typeof agGrid === "undefined") {
            console.error("AG Grid library not found or container is missing.");
            return;
        }

        const gridOptions = {
            enableRtl: true,
            rowData: [],
            defaultColDef: {
                sortable: true,
                filter: true,
                resizable: true,
                editable: true,
                minWidth: 80
            },
            rowSelection: {
                mode: "multiRow",
                enableClickSelection: false
            },
            animateRows: true,
            singleClickEdit: true,
            stopEditingWhenCellsLoseFocus: true,
            suppressRowClickSelection: true,
            undoRedoCellEditing: true,
            undoRedoCellEditingLimit: 20,
            getRowId: params => params.data._rowKey,
            rowClassRules: {
                "item-discount-row": params => Number(params.data?.itemType) === 4,
                "item-fee-row": params => Number(params.data?.itemType) === 3
            },
            columnDefs: [
                {
                    headerName: "",
                    width: 20, // کمی کوچک‌تر
                    checkboxSelection: true,
                    headerCheckboxSelection: true,
                    editable: false,
                    sortable: false,
                    filter: false,
                    pinned: "right"
                },
                {
                    headerName: "#",
                    field: "sortOrder",
                    width: 50,
                    minWidth: 60,
                    editable: false,
                    sortable: false,
                    filter: false,
                    valueGetter: params => params.node.rowIndex + 1
                },
                {
                    headerName: "عنوان کالا / خدمت",
                    field: "title",
                    flex: 2, // ستون اصلی (بیشترین فضا)
                    minWidth: 220,
                    editable: true,
                    cellEditor: "agTextCellEditor",
                    cellClassRules: {
                        "bg-light-danger": params => !String(params.value || "").trim()
                    }
                },
                {
                    headerName: "نوع",
                    field: "itemType",
                    width: 100, // کافی برای انتخاب
                    cellEditor: "agSelectCellEditor",
                    cellEditorParams: {
                        values: [1, 2, 3, 4]
                    },
                    valueFormatter: params => this.getItemTypeTitle(params.value)
                },
                {
    headerName: "دسته",
    field: "categoryId",
    width: 130, // کافی
    editable: false,
    cellRenderer: (params) => {
        const catTitle = params.data?.categoryTitle;
        const hasCategory = Boolean(params.value);

        const labelHtml = hasCategory
            ? `<span class="text-truncate d-inline-block" style="max-width: 110px;" title="${catTitle || ''}">${catTitle || 'انتخاب شده'}</span>`
            : `<span class="text-muted small">-- انتخاب --</span>`;

        return `
            <div class="d-flex align-items-center justify-content-between w-100" style="height: 100%;">
                ${labelHtml}
                <div class="d-flex align-items-center gap-1">
                    <button type="button" class="btn btn-xs btn-outline-secondary p-1 js-pick-category" title="انتخاب دسته">
                        <i class="bi bi-search"></i>
                    </button>
                    ${hasCategory ? `
                        <button type="button" class="btn btn-xs btn-link text-danger p-0 js-clear-category" title="حذف دسته">
                            <i class="bi bi-x"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    },
    onCellClicked: (params) => {
        // کلیک روی دکمه ذره‌بین
        if (params.event.target.closest(".js-pick-category")) {
            this.openCategoryPickerModal(params.node);
            return;
        }

        // کلیک روی دکمه پاک کردن دسته
        if (params.event.target.closest(".js-clear-category")) {
            params.data.categoryId = null;
            params.data.categoryTitle = "";
            params.api.refreshCells({ rowNodes: [params.node], columns: ["categoryId"], force: true });
        }
    }
},
                {
                    headerName: "مقدار",
                    field: "quantity",
                    width: 80,
                    type: "numericColumn",
                    cellClass: "number-cell",
                    valueParser: params => this.parsePositiveDecimal(params.newValue, 1),
                    valueFormatter: params => this.formatQuantity(params.value)
                },
                {
                    headerName: "واحد",
                    field: "unit",
                    width: 90,
                    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
        values: ["", "عدد", "کیلوگرم", "گرم", "بسته", "جعبه", "لیتر", "متر", "ساعت"]
    },
    valueFormatter: params => {
        // اگر مقداری انتخاب نشده بود، چیزی نشان ندهد یا متن پیش‌فرض بگذارد
        return params.value ? params.value : "";
    }
                },
                {
                    headerName: "فی",
                    field: "unitPrice",
                    width: 110,
                    type: "numericColumn",
                    cellClass: "number-cell",
                    valueParser: params => this.parseNonNegativeDecimal(params.newValue),
                    valueFormatter: params => this.formatCurrency(params.value)
                },
                {
                    headerName: "ناخالص",
                    field: "grossPrice",
                    width: 100,
                    editable: false,
                    type: "numericColumn",
                    cellClass: "number-cell",
                    valueGetter: params => this.calculateGrossPrice(params.data),
                    valueFormatter: params => this.formatCurrency(params.value)
                },
                {
                    headerName: "تخفیف",
                    field: "totalDiscount",
                    width: 125,
                    type: "numericColumn",
                    cellClass: "number-cell discount-cell",
                    valueParser: params => this.parseNonNegativeDecimal(params.newValue),
                    valueFormatter: params => this.formatCurrency(params.value)
                },
                {
                    headerName: "جمع",
                    field: "totalPrice",
                    width: 145,
                    editable: false,
                    type: "numericColumn",
                    cellClass: "number-cell total-cell",
                    valueGetter: params => this.calculateTotalPrice(params.data),
                    valueFormatter: params => this.formatCurrency(params.value)
                }
                // {
                //     headerName: "عملیات",
                //     width: 75,
                //     minWidth: 75,
                //     maxWidth: 75,
                //     pinned: "left",
                //     editable: false,
                //     sortable: false,
                //     filter: false,
                //     cellRenderer: () => `
                //         <button type="button" class="btn btn-sm btn-link text-danger p-0 js-remove-item" title="حذف قلم">
                //             <i class="bi bi-trash"></i>
                //         </button>
                //     `,
                //     onCellClicked: params => {
                //         const button = params.event.target.closest(".js-remove-item");
                //         if (button) {
                //             this.removeItemRow(params.node);
                //         }
                //     }
                // }
            ],
             onFirstDataRendered: params => {
                // روش اول: اندازه‌گیری خودکار بر اساس محتوای سلول‌ها
                // (اگر می‌خواهید دقیقاً بر اساس عرض متن‌ها تنظیم شود)
                const allColumnIds = params.api.getColumns().map(col => col.getId());
                params.api.autoSizeColumns(allColumnIds);

                // روش دوم (ترکیبی): اگر می‌خواهید ستون‌ها محتوا را ملاک قرار دهند اما کل عرض جدول را هم پر کنند:
                // params.api.sizeColumnsToFit();
            },
            onCellValueChanged: params => this.onItemCellValueChanged(params),
            onRowDataUpdated: () => this.recalculateItemsSummary(),
            onModelUpdated: () => this.recalculateItemsSummary()
        };

        this.itemsGridApi = agGrid.createGrid(this.itemsGridElement, gridOptions);
    }

    /* -------------------------------------------------------------
       ۲. مدیریت رویدادها
    ------------------------------------------------------------- */
    initEventListeners() {

        // تغییر نوع تراکنش (نمایش/مخفی کردن حساب مقصد برای Transfer)
     const $typeSelect = $(this.form).find('#Type');

    $typeSelect.on('change', () => {
        const val = Number($typeSelect.val());
        const isTransfer = (val === 3);

        // مخفی/نمایش دادن سطر حساب مقصد
        if (this.targetAccountRow) {
            this.targetAccountRow.classList.toggle("d-none", !isTransfer);
        }

        // اگر نوع انتقال نبود، حساب مقصد پاک شود
        if (!isTransfer) {
            window.setEntityPickerValue('TargetAccountId', '', '');
        }
    });

        // افزودن قلم جدید
        this.btnAddItem?.addEventListener("click", () => {
            this.addItemRow();
        });

        // حذف سطرهای انتخابی
        this.btnRemoveSelectedItems?.addEventListener("click", () => {
            this.removeSelectedItems();
        });

        // شنود تغییر مبالغ سربرگ برای محاسبه مجدد
        ["header-tax", "header-shipping", "header-fee", "header-discount"].forEach(id => {
            document.getElementById(id)?.addEventListener("input", () => {
                this.recalculateItemsSummary();
            });
        });

        // ارسال فرم
        this.form.addEventListener("submit", async event => {
            event.preventDefault();
            this.itemsGridApi?.stopEditing();
            await this.handleSubmit();
        });

        // دریافت پیام انتخاب دسته از مدال پاپ‌آپ
window.addEventListener("message", (event) => {
    const data = event.data;
    if (data && data.type === "ENTITY_PICKED" && data.data) {
        this.onCategorySelectedFromModal(data.data.id, data.data.title);
    }
});
//    $('[name="Type"]').on('change', function () {
//        const isTransfer = $(this).val() === '3';
//        $('#target-account-row').toggle(isTransfer);
//    });
        // تغییر وضعیت سوئیچ اقلام
this.hasItemsToggle?.addEventListener("change", (e) => {
    const isChecked = e.target.checked;
    this.toggleItemsSection(isChecked);
});

    }

    /* -------------------------------------------------------------
       ۳. افزودن، حذف و نرمال‌سازی سطرها در گرید
    ------------------------------------------------------------- */
    addItemRow(item = null) {
        if (!this.itemsGridApi) return;

        const row = this.normalizeItemRow(item);
        this.itemsGridApi.applyTransaction({ add: [row] });
        this.resequenceItems();
        this.recalculateItemsSummary();

        setTimeout(() => {
            const node = this.itemsGridApi.getRowNode(row._rowKey);
            if (node) {
                this.itemsGridApi.ensureNodeVisible(node);
                this.itemsGridApi.startEditingCell({
                    rowIndex: node.rowIndex,
                    colKey: "title"
                });
            }
        }, 50);
    }

    removeItemRow(rowNode) {
        if (!rowNode?.data || !this.itemsGridApi) return;
        this.itemsGridApi.applyTransaction({ remove: [rowNode.data] });
        this.resequenceItems();
        this.recalculateItemsSummary();
    }

    removeSelectedItems() {
        if (!this.itemsGridApi) return;
        const selectedRows = this.itemsGridApi.getSelectedRows();
        if (!selectedRows.length) {
            abp.notify?.warn?.("حداقل یک سطر را برای حذف علامت بزنید.") || alert("سطری انتخاب نشده است.");
            return;
        }

        this.itemsGridApi.applyTransaction({ remove: selectedRows });
        this.resequenceItems();
        this.recalculateItemsSummary();
    }

    normalizeItemRow(item = null) {
        const val = item || {};
        const id = val.id ?? val.Id ?? null;
        const quantity = this.parsePositiveDecimal(val.quantity ?? val.Quantity, 1);
        const unitPrice = this.parseNonNegativeDecimal(val.unitPrice ?? val.UnitPrice);
        const totalDiscount = this.parseNonNegativeDecimal(val.totalDiscount ?? val.totalDiscount);
        const itemType = Number(val.itemType ?? val.ItemType ?? 1);
 const categoryId = val.categoryId ?? val.CategoryId ?? null;

    // پیدا کردن عنوان دسته از لیست دسته‌های کش شده در فرم
    let categoryTitle = val.categoryTitle ?? val.CategoryTitle ?? "";
    if (!categoryTitle && categoryId && Array.isArray(this.categoriesList)) {
        const found = this.categoriesList.find(c => String(c.id || c.Id) === String(categoryId));
        if (found) categoryTitle = found.title || found.Title || "";
    }
        const row = {
            _rowKey: id || `tmp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            id: id,
            title: val.title ?? val.Title ?? "",
            itemType: [1, 2, 3, 4].includes(itemType) ? itemType : 1,
            quantity: quantity,
            unit: val.unit ?? val.Unit ?? "عدد",
            unitPrice: unitPrice,
            grossPrice: 0,
            totalDiscount: totalDiscount,
            totalPrice: 0,
                    categoryId: categoryId,
        categoryTitle: categoryTitle, // اضافه شده برای رندر متن دسته در سلول
            categoryId: val.categoryId ?? val.CategoryId ?? null,
            barcode: val.barcode ?? val.Barcode ?? "",
            note: val.note ?? val.Note ?? "",
            sortOrder: Number(val.sortOrder ?? val.SortOrder ?? 0)
        };

        this.updateCalculatedItemFields(row);
        return row;
    }

    resequenceItems() {
        let order = 1;
        this.itemsGridApi?.forEachNode(node => {
            if (node.data) {
                node.data.sortOrder = order++;
            }
        });
        this.itemsGridApi?.refreshCells({ columns: ["sortOrder"], force: true });
    }

    /* -------------------------------------------------------------
       ۴. محاسبات ریاضی سطری و جمع سربرگ
    ------------------------------------------------------------- */
    calculateGrossPrice(item) {
        if (!item) return 0;
        const qty = this.parsePositiveDecimal(item.quantity, 0);
        const price = this.parseNonNegativeDecimal(item.unitPrice);
        return qty * price;
    }

    calculateTotalPrice(item) {
        if (!item) return 0;
        const gross = this.calculateGrossPrice(item);
        const discount = this.parseNonNegativeDecimal(item.totalDiscount);
        return Math.max(0, gross - discount);
    }

    updateCalculatedItemFields(item) {
        item.grossPrice = this.calculateGrossPrice(item);
        item.totalDiscount = this.parseNonNegativeDecimal(item.totalDiscount);
        item.totalPrice = this.calculateTotalPrice(item);
    }

    onItemCellValueChanged(params) {
        if (!params.data) return;
        this.updateCalculatedItemFields(params.data);
        params.api.refreshCells({
            rowNodes: [params.node],
            columns: ["grossPrice", "totalPrice", "totalDiscount"],
            force: true
        });
        params.api.redrawRows({ rowNodes: [params.node] });
        this.recalculateItemsSummary();
    }

    getAllItemRows() {
        const rows = [];
        this.itemsGridApi?.forEachNode(node => {
            if (node.data) {
                this.updateCalculatedItemFields(node.data);
                rows.push(node.data);
            }
        });
        return rows;
    }

    recalculateItemsSummary() {
        const rows = this.getAllItemRows();
        let grossTotal = 0;
        let discountTotal = 0;
        let positiveTotal = 0;
        let discountItemTotal = 0;

        rows.forEach(item => {
            const gross = this.calculateGrossPrice(item);
            const discount = this.parseNonNegativeDecimal(item.totalDiscount);
            const total = this.calculateTotalPrice(item);

            grossTotal += gross;
            discountTotal += discount;

            if (Number(item.itemType) === 4) {
                // قلم تخفیف مستقل
                discountItemTotal += total;
            } else {
                positiveTotal += total;
            }
        });

        const itemsNetTotal = Math.max(0, positiveTotal - discountItemTotal);

        this.setSummaryValue("items-row-count", rows.length, false);
        this.setSummaryValue("items-gross-total", grossTotal);
        this.setSummaryValue("items-discount-total", discountTotal + discountItemTotal);
        this.setSummaryValue("items-net-total", itemsNetTotal);

        // بروزرسانی خودکار Amount سربرگ اگر اقلام وجود داشته باشند
        if (rows.length > 0 && this.amountInput) {
            const tax = this.getNumericInputValue("header-tax");
            const shipping = this.getNumericInputValue("header-shipping");
            const fee = this.getNumericInputValue("header-fee");
            const headerDiscount = this.getNumericInputValue("header-discount");

            const finalAmount = Math.max(0, itemsNetTotal + tax + shipping + fee - headerDiscount);
            this.amountInput.value = finalAmount;
        }
    }

    setSummaryValue(elementId, value, useCurrency = true) {
        const el = document.getElementById(elementId);
        if (!el) return;
        el.textContent = useCurrency ? this.formatCurrency(value) : Number(value || 0).toLocaleString("fa-IR");
    }

    getNumericInputValue(elementId) {
        const val = document.getElementById(elementId)?.value;
        return this.parseNonNegativeDecimal(val);
    }

    /* -------------------------------------------------------------
       ۵. بارگذاری Lookups و اطلاعات اولیه (حالت Edit/Create)
    ------------------------------------------------------------- */
    async loadLookups() {
        try {
            // دریافت حساب‌ها
            const accountService = window.lifeFlow?.finance?.account || abp?.services?.app?.account;
            if (accountService?.getList) {
                const res = await accountService.getList({ maxResultCount: 1000 });
                const accounts = res.items || res;
                this.fillSelectOptions(this.accountSelect, accounts, "id", "title");
                this.fillSelectOptions(this.targetAccountSelect, accounts, "id", "title");
            }

            // دریافت دسته‌بندی‌ها
            const categoryService = window.lifeFlow?.finance?.category || abp?.services?.app?.category;
            if (categoryService?.getList) {
                const res = await categoryService.getList({ maxResultCount: 1000 });
                this.categoriesList = res.items || res;
                this.fillSelectOptions(this.categorySelect, this.categoriesList, "id", "title");
            }

            // دریافت مخاطبین
            const contactService = window.lifeFlow?.finance?.contact || abp?.services?.app?.contact;
            if (contactService?.getList) {
                const res = await contactService.getList({ maxResultCount: 1000 });
                const contacts = res.items || res;
                this.fillSelectOptions(this.contactSelect, contacts, "id", "name");
            }
        } catch (err) {
            console.warn("Error loading lookups:", err);
        }
    }

    fillSelectOptions(selectEl, items, valField, textField) {
        if (!selectEl || !Array.isArray(items)) return;
        const currentVal = selectEl.value;
        selectEl.innerHTML = `<option value="">-- انتخاب کنید --</option>`;
        items.forEach(i => {
            const opt = document.createElement("option");
            opt.value = i[valField] || i[valField.toLowerCase()] || i.Id;
            opt.textContent = i[textField] || i[textField.toLowerCase()] || i.Title || i.Name;
            selectEl.appendChild(opt);
        });
        if (currentVal) selectEl.value = currentVal;
    }

    initFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get("id");
        if (id) {
            this.mode = "edit";
            this.idInput.value = id;
            this.load(id);
        } else {
            this.mode = "create";
            // تاریخ پیش‌فرض شمسی جاری در صورت خالی بودن
            if (this.persianDateInput && !this.persianDateInput.value) {
                const now = new Date();
                const faDate = new Intl.DateTimeFormat("fa-IR-u-nu-latn", {
                    year: "numeric", month: "2-digit", day: "2-digit",
                    hour: "2-digit", minute: "2-digit", hour12: false
                }).format(now);
                this.persianDateInput.value = faDate.replace(",", "");
            }
        }
    }

    async load(id) {
        this.toggleLoading(true);
        try {
           
            const tx = await lifeFlow.finance.transaction.get(id);
            this.fillData(tx);

         
            this.setItemsGridData(tx.items || []);
        } catch (err) {
            console.error("Load transaction failed:", err);
            abp.notify?.error?.(this.getErrorMessage(err, "خطا در بازیابی اطلاعات تراکنش"));
        } finally {
            this.toggleLoading(false);
        }
    }
    setNumberInputValue(element, value) 
    {
        element.value=value??0;
        element.dispatchEvent(new Event('change', { bubbles: true }));
      
    }

    fillData(tx) {
        if (!tx) return;
        this.idInput.value = tx.id || tx.Id;


        this.typeSelect.value = tx.type ;
        window.jQuery(this.typeSelect).trigger("change");

        this.setNumberInputValue(this.amountInput,tx.amount);

        window.setEntityPickerValue('AccountId', tx.accountId, tx.accountTitle);



        this.persianDateInput.value = tx.persianDate;
        if (tx.targetAccountId) {
            window.setEntityPickerValue('TargetAccountId', tx.targetAccountId, tx.targetAccountTitle);
        }


        if (tx.categoryId) {
            window.setEntityPickerValue('CategoryId', tx.categoryId, tx.categoryTitle);
        }

         if (tx.contactId) {
            window.setEntityPickerValue('ContactId', tx.contactId, tx.contactName);
        }
        this.counterpartyInput.value = tx.counterparty;
        this.userNoteInput.value = tx.userNote;

        this.setNumberInputValue(this.quantityInput,tx.quantity);
        this.setNumberInputValue(this.unitPriceInput,tx.unitPrice);
        this.unitSelect.value = tx.unit ;
        window.jQuery(this.unitSelect).trigger("change");


        // مقادیر سربرگ
        document.getElementById("header-discount").value = tx.headerDiscountAmount ?? tx.HeaderDiscountAmount ?? "";
        document.getElementById("header-tax").value = tx.taxAmount ?? tx.TaxAmount ?? "";
        document.getElementById("header-shipping").value = tx.shippingFee ?? tx.ShippingFee ?? "";
        document.getElementById("header-fee").value = tx.feeAmount ?? tx.FeeAmount ?? "";


        
       
        document.getElementById("transaction-tags").value = tx.tags ?? tx.Tags ?? "";
  
        const isReconciledEl = document.getElementById("transaction-is-reconciled");
        if (isReconciledEl) isReconciledEl.checked = Boolean(tx.isReconciled ?? tx.IsReconciled);

        // وضعیت حساب مقصد
         const isTransfer = Number(this.typeSelect.value) === 3;
         this.targetAccountRow?.classList.toggle("d-none", !isTransfer);
   
    }

    setItemsGridData(items) {
        if (!this.itemsGridApi) return;

           const hasItems = Array.isArray(items) && items.length > 0;
    
 
    // وضعیت سوئیچ و کانتینر را بر اساس وجود اقلام ست کن
    if (this.hasItemsToggle) {
        this.hasItemsToggle.checked = hasItems;
    }
    if (this.itemsContainer) {
        this.itemsContainer.classList.toggle("d-none", !hasItems);
    }
    const rowData = hasItems
        ? items.map(i => this.normalizeItemRow(i)).sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
        : [];


        this.itemsGridApi.setGridOption("rowData", rowData);
        this.resequenceItems();
        this.recalculateItemsSummary();
    }

    /* -------------------------------------------------------------
       ۶. ارسال و ثبت نهایی فرم
    ------------------------------------------------------------- */
    collectItemsPayload() {
        debugger;
        this.itemsGridApi?.stopEditing();
        const items = this.getAllItemRows();

        return items.map((item, idx) => ({
            id: item.id || null,
            title: String(item.title || "").trim(),
            quantity: this.parsePositiveDecimal(item.quantity, 1),
            unitPrice: this.parseNonNegativeDecimal(item.unitPrice),
            totalDiscount: this.parseNonNegativeDecimal(item.totalDiscount),
            itemType: Number(item.itemType || 1),
            categoryId: item.categoryId || null,
            unit: String(item.unit || "").trim() || null,
            barcode: String(item.barcode || "").trim() || null,
            sortOrder: idx + 1,
            note: String(item.note || "").trim() || null
        }));
    }

    getPayload() {
        this.itemsGridApi?.stopEditing();
    const hasItemsEnabled = Boolean(this.hasItemsToggle?.checked);
    const rawItems = hasItemsEnabled ? this.collectItemsPayload() : [];
    
    const items = this.mode === "create"
        ? rawItems.map(({ id, ...rest }) => rest)
        : rawItems;

        return {
            accountId: this.getGuidValue("AccountId"),
            type: Number(this.typeSelect?.value),
            amount: this.parseNonNegativeDecimal(this.amountInput?.value),
            unitPrice: this.parseNonNegativeDecimal(this.unitPriceInput?.value),
            quantity: this.parseNonNegativeDecimal(this.quantityInput?.value),
            unit:this.unitSelect?.value,
            transactionDate: null,
            persianDate: this.persianDateInput?.value?.trim() || null,
            feeAmount: this.getNullableDecimal("header-fee"),
            headerDiscountAmount: this.getNullableDecimal("header-discount"),
            taxAmount: this.getNullableDecimal("header-tax"),
            shippingFee: this.getNullableDecimal("header-shipping"),
            categoryId: this.getGuidValue("CategoryId"),
            contactId: this.getGuidValue("ContactId"),
            targetAccountId: Number(this.typeSelect?.value) === 3 ? this.getGuidValue("TargetAccountId") : null,
            counterparty: this.getStringValue("Counterparty"),
            userNote: this.getStringValue("UserNote"),
            tags: this.getStringValue("Tags"),
            isReconciled: Boolean(document.getElementById("transaction-is-reconciled")?.checked),
            ...(this.mode === "edit" ? { replaceItems: true } : {}),
            items: items
        };
    }

    validateItems(items) {
        for (let i = 0; i < items.length; i++) {
            const row = items[i];
            if (!row.title) {
                return { isValid: false, message: `عنوان قلم ردیف ${i + 1} وارد نشده است.` };
            }
            if (!(row.quantity > 0)) {
                return { isValid: false, message: `تعداد ردیف ${i + 1} باید بزرگتر از صفر باشد.` };
            }
            if (row.unitPrice < 0) {
                return { isValid: false, message: `قیمت واحد ردیف ${i + 1} نامعتبر است.` };
            }
            const gross = row.quantity * row.unitPrice;
            if (row.discountAmount > gross) {
                return { isValid: false, message: `تخفیف ردیف ${i + 1} نمی‌تواند از مبلغ ناخالص بیشتر باشد.` };
            }
        }
        return { isValid: true };
    }

    async handleSubmit() {
        const payload = this.getPayload();

        if (!payload.accountId) {
            abp.notify?.warn?.("لطفاً حساب مالی را انتخاب کنید.") || alert("حساب مالی اجباری است.");
            return;
        }

        if (!payload.type) {
            abp.notify?.warn?.("نوع تراکنش را انتخاب کنید.");
            return;
        }

        if (payload.type === 3 && !payload.targetAccountId) {
            abp.notify?.warn?.("برای انتقال، انتخاب حساب مقصد الزامی است.");
            return;
        }

        if (payload.type === 3 && payload.accountId === payload.targetAccountId) {
            abp.notify?.warn?.("حساب مبدأ و مقصد نمی‌توانند یکسان باشند.");
            return;
        }

        if (!(payload.amount > 0)) {
            abp.notify?.warn?.("مبلغ نهایی تراکنش باید بیشتر از صفر باشد.");
            return;
        }

        const validation = this.validateItems(payload.items);
        if (!validation.isValid) {
            abp.notify?.warn?.(validation.message) || alert(validation.message);
            return;
        }

        this.toggleLoading(true);

        try {
            const txService = window.lifeFlow?.finance?.transaction || abp?.services?.app?.transaction;
            let result;

            if (this.mode === "create") {
                result = await txService.create(payload);
            } else {
                result = await txService.update(this.idInput.value, payload);
            }

            abp.notify?.success?.(this.mode === "create" ? "تراکنش با موفقیت ثبت شد." : "تراکنش با موفقیت به‌روزرسانی شد.");

  const notifyPayload = { type: "TRANSACTION_SAVED", action: this.mode, transaction: result };   
      

      if (window.parent && window.parent !== window) {
        window.parent.postMessage(notifyPayload, "*");
      }

      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(notifyPayload, "*");
      }



   
        } catch (err) {
            console.error("Save error:", err);
            abp.notify?.error?.(this.getErrorMessage(err, "خطا در ذخیره تراکنش"));
        } finally {
            this.toggleLoading(false);
        }
    }

    /* -------------------------------------------------------------
       ۷. ابزارهای کمکی، تبدیل‌ها و فرمت اعداد
    ------------------------------------------------------------- */
    toggleLoading(isLoading) {
        if (!this.submitBtn) return;
        this.submitBtn.disabled = isLoading;
        this.spinner?.classList.toggle("d-none", !isLoading);
    }
toggleItemsSection(show) {
    if (!this.itemsContainer) return;

    if (show) {
        this.itemsContainer.classList.remove("d-none");
        
        // اگر ردیفی نبود، یک سطر خالی به عنوان شروع اضافه کن
        const rows = this.getAllItemRows();
        if (rows.length === 0) {
            this.addItemRow();
        }
        
        // تنظیم ابعاد AG Grid به محض آشکار شدن (جلوگیری از باگ عدم رندر عرض ستون‌ها)
        setTimeout(() => {
            this.itemsGridApi?.sizeColumnsToFit();
        }, 50);
        
        this.recalculateItemsSummary();
    } else {
        // اگر کاربر تیک را برداشت و ردیف‌هایی وجود داشت، تأییدیه بخواهیم
        const rows = this.getAllItemRows();
        if (rows.length > 0) {
            if (!confirm("با غیرفعال‌سازی این بخش، اقلام ثبت‌شده حذف خواهند شد. ادامه می‌دهید؟")) {
                this.hasItemsToggle.checked = true;
                return;
            }
        }
        
        this.itemsContainer.classList.add("d-none");
        // پاکسازی سطرهای گرید
        this.itemsGridApi?.setGridOption("rowData", []);
        this.recalculateItemsSummary();
    }
}

    normalizeDigits(value) {
        return String(value ?? "")
            .replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
            .replace(/[٠-٩]/g, d => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
            .replace(/[٬,]/g, "")
            .trim();
    }

    parseNonNegativeDecimal(value) {
        const normalized = this.normalizeDigits(value);
        const parsed = Number.parseFloat(normalized);
        return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
    }

    parsePositiveDecimal(value, defaultValue = 1) {
        const parsed = this.parseNonNegativeDecimal(value);
        return parsed > 0 ? parsed : defaultValue;
    }

    formatCurrency(value) {
        return Number(value || 0).toLocaleString("fa-IR", { maximumFractionDigits: 2 });
    }

    formatQuantity(value) {
        return Number(value || 0).toLocaleString("fa-IR", { minimumFractionDigits: 0, maximumFractionDigits: 3 });
    }

    getItemTypeTitle(value) {
        switch (Number(value)) {
            case 1: return "کالا";
            case 2: return "خدمت";
            case 3: return "کارمزد";
            case 4: return "تخفیف";
            default: return "سایر";
        }
    }

    getGuidValue(fieldName) {
        const val = this.form.querySelector(`[name="${fieldName}"]`)?.value?.trim();
        return val || null;
    }

    getStringValue(fieldName) {
        const val = this.form.querySelector(`[name="${fieldName}"]`)?.value?.trim();
        return val || null;
    }

    getNullableDecimal(elementId) {
        const input = document.getElementById(elementId);
        if (!input || input.value === "") return null;
        return this.parseNonNegativeDecimal(input.value);
    }

    getErrorMessage(error, fallback) {
        return (
            error?.responseJSON?.error?.details ||
            error?.responseJSON?.error?.message ||
            error?.error?.details ||
            error?.error?.message ||
            error?.message ||
            fallback
        );
    }


    /**
 * باز کردن مدال انتخاب دسته برای یک سطر مشخص
 */
openCategoryPickerModal(rowNode) {
    this.activeItemRowNodeForCategory = rowNode;

    // مسیر صفحه مدال انتخاب دسته شما (با استفاده از تابع باز کردن پاپ‌آپ پروژه)
    const modalUrl = window.appUrl 
        ? window.appUrl("/transactions/categories-list-modal.html") 
        : "/finance/categories/list-modal.html";

    if (typeof openPopup === "function") {
        openPopup({
            url: modalUrl,
            title: "انتخاب دسته‌بندی",
            onMessage: (data) => {
                if (data && data.type === "ENTITY_PICKED" && data.data) {
                    if (typeof closePopup === "function") closePopup();
                    this.onCategorySelectedFromModal(data.data.id, data.data.title);
                }
            }
        });
    } else {
        // فال‌بک در صورت نبود سیستم openPopup
        window.open(modalUrl, "CategoryPicker", "width=850,height=650,scrollbars=yes");
    }
}

/**
 * اعمال دسته‌بندی انتخاب‌شده روی سطر فعال و کشیدن مجدد سلول
 */
onCategorySelectedFromModal(categoryId, categoryTitle) {
    if (!this.activeItemRowNodeForCategory || !this.itemsGridApi) return;

    const rowData = this.activeItemRowNodeForCategory.data;
    if (rowData) {
        rowData.categoryId = categoryId;
        rowData.categoryTitle = categoryTitle;

        // اگر عنوان قلم خالی بود، نام دسته را به عنوان پیش‌فرض ست کن
        if (!rowData.title || rowData.title.trim() === "") {
            rowData.title = categoryTitle;
        }

        // بروزرسانی سلول‌های مربوطه در گرید
        this.itemsGridApi.refreshCells({
            rowNodes: [this.activeItemRowNodeForCategory],
            columns: ["categoryId", "title"],
            force: true
        });
    }

    this.activeItemRowNodeForCategory = null;
}

}

// ساخت نمونه پس از بارگذاری کامل DOM
document.addEventListener("DOMContentLoaded", () => {
    window.transactionForm = new TransactionForm();
});
