import type { AgColumn, IShowRowGroupColsService, NamedBean, SortDirection } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
export declare class ShowRowGroupColsService extends BeanStub implements NamedBean, IShowRowGroupColsService {
    beanName: "showRowGroupCols";
    readonly columns: AgColumn[];
    private readonly sourceCols;
    private readonly colsSet;
    destroy(): void;
    /** Reset the per-column `showRowGroupCol` back-references set on the previous build. */
    private clearStamps;
    refresh(): void;
    getSourceColumnsForGroupColumn(groupCol: AgColumn): AgColumn[] | null;
    isRowGroupDisplayed(column: AgColumn, colId: string | null): boolean;
    interleaveSortedColumns(sorted: AgColumn[]): AgColumn[];
    fillCoupledSortIndexMap(sortedCols: AgColumn[], map: Map<AgColumn, number>): number;
    isGroupSortMixed(column: AgColumn, direction: SortDirection): boolean;
}
