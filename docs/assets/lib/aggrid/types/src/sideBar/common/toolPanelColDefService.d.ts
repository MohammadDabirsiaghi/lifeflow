import type { AbstractColDef, AgColumn, BeanCollection, ColumnModel } from 'ag-grid-community';
import { AgProvidedColumnGroup } from 'ag-grid-community';
export declare function toolPanelCreateColumnTree(beans: BeanCollection, colDefs: AbstractColDef[]): (AgColumn | AgProvidedColumnGroup)[];
export declare function syncLayoutWithGrid(colModel: ColumnModel, syncLayoutCallback: (colDefs: AbstractColDef[]) => void): void;
export declare function syncLayoutWithColumns(columns: AgColumn[], syncLayoutCallback: (colDefs: AbstractColDef[]) => void): void;
