import type { AgColumn, IPivotColsService, NamedBean } from 'ag-grid-community';
import { OrderedColsService } from '../columns/orderedColsService';
export declare class PivotColsSvc extends OrderedColsService implements NamedBean, IPivotColsService {
    beanName: "pivotColsSvc";
    protected eventName: "columnPivotChanged";
    protected enableProp: "pivot";
    protected indexProp: "pivotIndex";
    protected initialEnableProp: "initialPivot";
    protected initialIndexProp: "initialPivotIndex";
    /** True if any active pivot col has a `pivotComparator`; cached so {@link isStrictColumnOrder} stays O(1). */
    private hasPivotComparator;
    postConstruct(): void;
    protected setActiveFlag(col: AgColumn, active: boolean): boolean;
    /** Stamps each active pivot col's position (`pivotActiveIndex`) and refreshes {@link hasPivotComparator}. */
    protected onColumnsChanged(): void;
    /** Computed live: a `pivotSort` toggle does not change pivot-column membership, so it can't be cached.
     *  Any explicitly-set direction counts, including `null` ("no sort"); only the unset default (`undefined`)
     *  does not - so clearing to `null` still forces the freshly-generated natural order over the sticky one. */
    hasInteractivePivotSort(): boolean;
    isStrictColumnOrder(): boolean;
    reRankByPivotGroupOrder(defColsList: AgColumn[], stickyOrder: string[], colsById: Record<string, AgColumn>): string[];
}
