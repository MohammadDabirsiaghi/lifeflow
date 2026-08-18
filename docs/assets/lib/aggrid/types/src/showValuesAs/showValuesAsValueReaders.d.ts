import type { AgColumn, ColKey, IPivotResultColsService, IRowNode } from 'ag-grid-community';
/** Unwraps an aggregation wrapper (e.g. `avg`'s `{ value, count }`) to its scalar; returns non-wrappers as-is. */
export declare const unwrapAggValue: (value: any) => any;
/** Numeric coercion for transforms: `null` for non-numeric or non-finite (so the cell blanks). Shares the
 *  agg-unwrap coercion with `valueConversion` (which returns `0` for non-numeric — here we need `null`). */
export declare const numericOrNull: (value: unknown) => number | null;
/** Reads a node's aggregated value for a column, unwrapping avg/count wrappers to a number. */
export declare const readAggScalar: (node: IRowNode, column: AgColumn) => number | null;
/** Reads a node's value (aggregate on group rows, leaf value on data rows) as a number. */
export declare const readNodeValue: (node: IRowNode, column: AgColumn) => number | null;
/** The pivot result column with pivot `keys` for value field `valueField`, or `null` when not resolvable. */
export declare const pivotResultCol: (pivotResultCols: IPivotResultColsService | undefined, keys: string[], valueField: ColKey) => AgColumn | null;
