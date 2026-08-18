import type { BeanCollection, RowNode } from 'ag-grid-community';
export declare function getFormulaRowByIndex(beans: BeanCollection, rowIndex: number): RowNode | null;
export declare function getFormulaRowIndex(row: RowNode): number | null;
export declare function isFormulaRowAvailable(row: RowNode): boolean;
