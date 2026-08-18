import type { BeanCollection, ColDef, ColGroupDef, IPivotColDefService, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
export declare class PivotColDefService extends BeanStub implements NamedBean, IPivotColDefService {
    beanName: "pivotColDefSvc";
    private colModel;
    private pivotColsSvc?;
    private valueColsSvc?;
    private colNames;
    wireBeans(beans: BeanCollection): void;
    private fieldSeparator;
    private pivotDefaultExpanded;
    postConstruct(): void;
    createPivotColumnDefs(uniqueValues: Map<string, any>): (ColDef | ColGroupDef)[];
    private createPivotColumnsFromUniqueValues;
    private recursivelyBuildGroup;
    private buildMeasureCols;
    private addExpandablePivotGroups;
    private addPivotTotalsToGroups;
    private recursivelyAddPivotTotal;
    private addRowGroupTotals;
    /**
     * Recreate a pivot colDef to update from a changed valueColumn colDef
     */
    recreateColDef(colDef: ColDef): ColDef;
    private createColDef;
    private sameAggFuncs;
    private merge;
    private generateColumnGroupId;
    private generateColumnId;
    /** Comparator ordering a pivot column's groups. `pivotSort` is isolated from `colDef.sort`:
     *  `null` keeps the natural (supplied or generated) order, `'desc'` reverses, and `'asc'` sorts ascending by
     *  the custom `pivotComparator` or header name. The unset default resolves via {@link _resolvePivotSort}. */
    private getPivotGroupComparator;
    /** Orders application-supplied pivot result colDefs by each pivot column's `pivotSort`, so pill sorting
     *  reaches them too. Depth maps to pivot level, as in {@link createColDefsFromFields}. Returns the supplied
     *  array itself when nothing moves; otherwise a reordered copy - the supplied defs are never mutated. */
    orderPivotResultColDefs(colDefs: (ColDef | ColGroupDef)[]): (ColDef | ColGroupDef)[];
    /**
     * Used by the SSRM to create secondary columns from provided fields
     * @param fields
     */
    createColDefsFromFields(fields: string[]): (ColDef | ColGroupDef)[];
}
