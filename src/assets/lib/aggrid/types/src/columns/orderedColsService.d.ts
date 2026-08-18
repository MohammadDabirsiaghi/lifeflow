import type { AgColumn, BeanCollection, ColumnEventType, ColumnState, ColumnStateParams, IOrderedColsService } from 'ag-grid-community';
import { BaseColsService } from './baseColsService';
/** Index-ordered boolean-activation services (`rowGroupColsSvc`/`pivotColsSvc`); owns shared state-sync,
 *  ordering and hierarchy seating. (`valueColsSvc` uses `aggFunc`, so extends the base directly.) */
export declare abstract class OrderedColsService extends BaseColsService implements IOrderedColsService {
    protected abstract readonly enableProp: 'rowGroup' | 'pivot';
    protected abstract readonly indexProp: 'rowGroupIndex' | 'pivotIndex';
    protected abstract readonly initialEnableProp: 'initialRowGroup' | 'initialPivot';
    protected abstract readonly initialIndexProp: 'initialRowGroupIndex' | 'initialPivotIndex';
    /** Writes just this col's role flag (`rowGroupActive`/`pivotActive`), returning false if already set (no-op). */
    protected abstract setActiveFlag(col: AgColumn, active: boolean): boolean;
    /** Flag write + per-col events; only the flag field (via {@link setActiveFlag}) and `enableProp` differ per service. */
    protected writeColActive(col: AgColumn, active: boolean, source: ColumnEventType): boolean;
    /** Hierarchy virtuals apply only to the ordered services — kept here so `BaseColsService` stays hierarchy-free. */
    private groupHierarchCols?;
    wireBeans(beans: BeanCollection): void;
    private getActiveHierarchyCols;
    extractCol(col: AgColumn, colIsNew: boolean): void;
    /** This col's hierarchy virtuals (date-part group levels) to seat immediately before it; undefined if none. */
    private getActiveVirtuals;
    /** Seat the col's hierarchy virtuals before it (bulk path; their flags are set later by the diff). */
    protected seatActiveCol(res: Set<AgColumn>, col: AgColumn): void;
    /** Incremental activate also seats (and flags) the col's hierarchy virtuals before it. */
    protected setColActive(col: AgColumn, active: boolean, source: ColumnEventType, runSideEffects?: boolean): boolean;
    syncColState(column: AgColumn, stateItem: ColumnState | null, defaultState: ColumnStateParams | undefined, source: ColumnEventType): void;
    /** Fold hierarchy ordering in front of the state-index sort; else fall back to the base index sort. */
    protected sortPendingCols(cols: AgColumn[]): boolean;
    /** Stamps synthetic `indexProp` onto `incoming`/`accumulator` so a `cellDataType`-inferred rowGroup/pivot
     *  flip keeps the original primary-col order (new cols slot in at their col-def position). */
    restoreColumnOrder(incoming: {
        [colId: string]: ColumnState;
    }, accumulator: {
        [colId: string]: ColumnState;
    }): void;
}
