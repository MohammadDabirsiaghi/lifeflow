import type { AgColumn, BeanCollection, GridApi, IRowNode, ShowValuesAsTransformParams } from 'ag-grid-community';
export declare class ShowValuesAsTransformParamsImpl implements ShowValuesAsTransformParams {
    readonly api: GridApi;
    readonly context: any;
    private readonly _beans;
    readonly column: AgColumn;
    readonly node: IRowNode;
    readonly aggValue: any;
    readonly params: any;
    private _rawValue;
    constructor(api: GridApi, context: any, _beans: BeanCollection, column: AgColumn, node: IRowNode, aggValue: any, params: any);
    get rawValue(): any;
    /** This column's total down the rows: the grand total when not pivoting, this pivot column's total when pivoting. */
    columnTotal(): number | null;
    /** The overall total: equal to {@link columnTotal} when not pivoting; when pivoting, the value field summed
     *  across all its pivot columns (the 2-D grand total, not just this pivot column). */
    grandTotal(): number | null;
    /** Root, ensuring its aggregate exists. The pipeline skips the root aggregate unless a grand-total row / pivot
     *  needs it, so a total mode triggers it on demand — synchronous, computes only the root from the already
     *  aggregated groups (no re-sort/filter/render). `null` aggData is the "not yet aggregated" sentinel. */
    private rootWithTotal;
    parentTotal(): number | null;
    parentColumnTotal(): number | null;
    /** Row total along the column axis: when pivoting, this value field summed across its pivot columns at the
     *  node; otherwise the cell's own value (a single field's row total is itself ⇒ 100%). */
    rowTotal(): number | null;
    private rowTotalAt;
}
