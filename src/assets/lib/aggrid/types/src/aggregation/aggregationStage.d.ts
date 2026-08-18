import type { ChangedPath, ClientSideRowModelStage, GridOptions, NamedBean, _IRowNodeAggregationStage } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
export declare class AggregationStage extends BeanStub implements NamedBean, _IRowNodeAggregationStage {
    beanName: "aggStage";
    readonly step: ClientSideRowModelStage;
    readonly refreshProps: (keyof GridOptions<any>)[];
    /** Tracks whether the previous execute() call produced aggData, so we only clear once on transition. */
    private hadAgg;
    execute(changedPath: ChangedPath | undefined): void;
    /** Re-aggregates only the root node, leaving every group aggregate untouched. Used when a Show Values As
     *  total mode is switched on for a grid not already aggregating the root (no grand-total row / pivot): the
     *  groups are already correct, only the root total is missing — so a full re-aggregation would be wasted work. */
    aggregateRootOnly(): void;
    private aggregate;
}
