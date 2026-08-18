import type { AgColumn, BeanCollection, Column, GridApi, ShowValuesAsColumnLists, ShowValuesAsMenuParams, ShowValuesAsType } from 'ag-grid-community';
/** The candidate columns a mode's menu can offer, plus the `getColumn` / `dimensionItems` helpers — computed
 *  lazily from the active row-group / pivot / value columns and shared across a column's modes (a mode reading
 *  only `rowGroups` never computes `valueColumns`, and the shared instance is not recomputed per mode). */
export declare class ShowValuesAsColumnListsImpl implements ShowValuesAsColumnLists {
    readonly column: AgColumn;
    private readonly _beans;
    private _rowGroups?;
    private _dimensions?;
    private _valueColumns?;
    constructor(column: AgColumn, _beans: BeanCollection);
    /** Active row-group fields, excluding the mode's own column. */
    get rowGroups(): AgColumn[];
    /** Active dimension fields (row-group ⊕ pivot), excluding the mode's own column. */
    get dimensions(): AgColumn[];
    /** Value (aggregated) columns other than this measure (cleanly resolved while pivoting via the same keys);
     *  the dimension fields are excluded. */
    get valueColumns(): AgColumn[];
    /** Distinct items (display order) of dimension field `field` — its pivot keys while pivoting, else its
     *  row-group keys. Capped to keep the menu usable on large data. */
    dimensionItems(field: string | Column): string[];
    getColumn(colId: string): AgColumn | null;
}
/** Per-mode {@link ShowValuesAsMenuParams}: a class with prototype methods. The column lists are created lazily
 *  on first access; `apply` delegates to the service bean, which owns the selection state. */
export declare class ShowValuesAsMenuParamsImpl implements ShowValuesAsMenuParams {
    readonly api: GridApi;
    readonly context: any;
    private readonly _beans;
    readonly column: AgColumn;
    readonly type: ShowValuesAsType;
    readonly active: boolean;
    readonly columnLists: ShowValuesAsColumnListsImpl;
    constructor(api: GridApi, context: any, _beans: BeanCollection, column: AgColumn, type: ShowValuesAsType, active: boolean, columnLists: ShowValuesAsColumnListsImpl);
    get currentParams(): any;
    apply(params?: any): void;
}
