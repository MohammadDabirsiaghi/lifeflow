import type { AgColumn, BeanCollection } from 'ag-grid-community';
interface HeaderReferenceEntry {
    column: AgColumn;
    colId: string;
    leafName: string;
    path: string[];
    reference: string;
}
export declare function createHeaderReferenceEntries(beans: BeanCollection, columns: AgColumn[], excludedColId?: string): HeaderReferenceEntry[];
export declare function isAmbiguousHeaderReference(entries: HeaderReferenceEntry[], reference: string, caseInsensitive?: boolean): boolean;
export {};
