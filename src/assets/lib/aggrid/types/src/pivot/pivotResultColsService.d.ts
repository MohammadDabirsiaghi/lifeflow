import type { AgColumn, AgProvidedColumnGroup, BeanCollection, ColDef, ColGroupDef, ColKey, ColumnEventType, IPivotResultColsService, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
export declare class PivotResultColsService extends BeanStub implements NamedBean, IPivotResultColsService {
    beanName: "pivotResultCols";
    private colModel;
    private visibleCols;
    wireBeans(beans: BeanCollection): void;
    pivotCols: AgColumn[] | null;
    pivotTree: (AgColumn | AgProvidedColumnGroup)[];
    pivotTreeDepth: number;
    /** Source value col → pivot result cols derived from it; lazily built on first `recreateColDefsForSource`
     *  after a rebuild (`null` ⇒ needs rebuild), so a rebuild with no value-col def change skips the O(N) walk. */
    private dependentsByValueCol;
    /** True iff any `pivotTree` group carries `marryChildren`; `ColumnModel` reads it while pivoting. */
    pivotHasMarryChildren: boolean;
    /** Non-padding groups in `pivotTree`, keyed by `groupId`. Built by `_buildColumnTree`. */
    pivotGroupsById: Map<string, AgProvidedColumnGroup>;
    /** Cols in `pivotTree` keyed by colId / userProvidedColDef ref / field. Cached so the next
     *  build's reuse lookup can skip the existing-tree DFS. */
    private pivotColsByKey;
    /** Every group (padding + non-padding) in `pivotTree`; the orphan sweep and `visibleColsService`
     *  (via `colModel.colsAllGroups`) need padding groups included when pruning/resetting `displayInstances`. */
    pivotAllGroups: AgProvidedColumnGroup[];
    /** Held between clear and the next apply so generated col instances are reused. */
    private savedPivot;
    /** The colDefs last passed to `setPivotResultColumns`, exactly as the application supplied them; `null` when
     *  the grid generated the current pivot result cols itself. Held so {@link resortPivotResultCols} can re-derive
     *  the order on a `pivotSort` change, and so `pivotSort: null` resolves back to the supplied order rather than
     *  to whatever the last direction produced. Never mutated - it is the application's array. */
    suppliedColDefs: (ColDef | ColGroupDef)[] | null;
    /** `undefined` = uncached, `null` = cached-but-empty. */
    private aggOrderedList;
    lookupPivotResultCol(pivotKeys: string[], valueColKey: ColKey): AgColumn | null;
    getAggregationOrderedList(): AgColumn[] | null;
    buildAllCols(): AgColumn[];
    buildColsInStateOrder(): AgColumn[];
    /** Primaries in `colsById` but not `colsList` (hidden/parked), in col-def order; `null` if there are none. */
    private collectParkedPrimaries;
    private loadAggregationOrderedList;
    setPivotResultCols(colDefs: (ColDef | ColGroupDef)[] | null, source: ColumnEventType, appSupplied?: boolean): void;
    /** Re-order the applied pivot result columns for the pivot columns' current `pivotSort`. Lets pill sorting
     *  reach application-supplied columns, which no `createColDefsFromFields` pass regenerates. */
    resortPivotResultCols(source: ColumnEventType): void;
    private orderColDefs;
    destroy(): void;
    /** Builds a new pivot result column tree from the supplied colDefs and refreshes display. */
    private applyPivotResultColDefs;
    private clearPivotResultCols;
    recreateColDefsForSource(sourceCol: AgColumn, source: ColumnEventType): void;
    private processPivotResultColDef;
}
