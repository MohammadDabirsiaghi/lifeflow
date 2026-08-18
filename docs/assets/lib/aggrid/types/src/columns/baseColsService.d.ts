import type { AgColumn, BeanCollection, ColKey, ColumnEventType, ColumnModel, ColumnState, ColumnStateParams, IColsService, _ColumnChangedEventType } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
export declare abstract class BaseColsService extends BeanStub implements IColsService {
    protected colModel: ColumnModel;
    protected abstract eventName: _ColumnChangedEventType;
    /** Membership + insertion order; the single source of truth (O(1), idempotent add). The per-col flag
     *  (`rowGroupActive`/…) is a denormalised copy of `has(col)` for the public `Column` API. */
    protected activeColSet: Set<AgColumn<any>>;
    /** Lazy array view of {@link activeColSet}; `null` when stale. */
    private colsCache;
    /** Extract-pass buckets, opened lazily per pass and released by {@link commitExtract} (no stale carry-over).
     *  `…WithIndex` = cols with an order key (sorted first in commit); `…WithValue` = the rest. */
    private extractColsWithIndex;
    private extractColsWithValue;
    /** Cols changed since the last flush; non-null = dirty. Dispatched once by {@link dispatchColChange}. */
    pendingChanged: Set<AgColumn> | null;
    /** A staged change moved the active set/order → re-stamp indexes once at flush ({@link flushReindex}). */
    private reindexPending;
    /** Order index recorded per active col during the current state-apply pass; consumed by {@link sortByPendingState}. */
    protected pendingStateOrder: Map<AgColumn, number> | null;
    /** Set when the current state-apply pass changed membership/order → re-sort + re-stamp at {@link sortByPendingState}. */
    protected pendingStateChanged: boolean;
    /** Bucket an indexed col, opening {@link extractColsWithIndex} lazily. */
    protected extractAddColWithIndex(col: AgColumn, key: number): void;
    /** Bucket a non-indexed (value) col, opening {@link extractColsWithValue} lazily. */
    protected extractAddColWithValue(col: AgColumn): void;
    /** Bucket `col` by its resolved order `key`: indexed (non-null) cols sort in `commitExtract`, the rest keep order. */
    protected bucketByKey(col: AgColumn, key: number | null | undefined): void;
    /** Active columns, in order. Ref-stable until the next edit. */
    get columns(): AgColumn[];
    wireBeans(beans: BeanCollection): void;
    /** Replace the active cols with `cols` (must be dup-free); `cols` doubles as the cached view. */
    protected resetActiveCols(cols: AgColumn[]): void;
    /** Activate/deactivate a col (O(1)): flag + per-col events via {@link writeColActive}, membership here, and
     *  the `runSideEffects`-gated {@link onColActiveChanged}. `OrderedColsService` overrides to seat virtuals. */
    protected setColActive(col: AgColumn, active: boolean, source: ColumnEventType, runSideEffects?: boolean): boolean;
    /** Per-subclass: set the col's role flag and, if it changed, dispatch its per-col events; returns whether it
     *  flipped. Only this col's state — not the active set (that's {@link setColActive}). */
    protected abstract writeColActive(col: AgColumn, active: boolean, source: ColumnEventType): boolean;
    /** Auto side-effects of (de)activate (rowGroup auto-hide, value default agg-func); only on `runSideEffects`
     *  (imperative paths). Default no-op. */
    protected onColActiveChanged(_col: AgColumn, _active: boolean, _source: ColumnEventType): void;
    /** Bulk diff: flip flags to match `targetSet` (insertion order = active order); `runSideEffects` runs
     *  {@link onColActiveChanged}. Reuses `targetSet` as the active set; `targetArr` seeds the cache, else lazy. */
    private applyActiveCols;
    /** After a flush, dispatch batched per-col side-effects (rowGroup `columnVisible`). Default no-op. */
    protected onColActiveChangesComplete(_source: ColumnEventType): void;
    /** React to a `this.columns` order/content change; `rowGroupColsSvc` stamps `rowGroupActiveIndex`. Default no-op. */
    protected onColumnsChanged(): void;
    /** Diff `before`→`after`, staging every changed col straight into `pendingChanged` (no intermediate array,
     *  left null when nothing changed): `'none'` identical, `'reorder'` same set moved, `'membership'` added/removed. */
    private stageChangedColsBetween;
    setColumns(colKeys: ColKey[] | undefined, source: ColumnEventType): void;
    /** Seat a col into `res`; base adds just the col, `OrderedColsService` seats its virtuals first. */
    protected seatActiveCol(res: Set<AgColumn>, col: AgColumn): void;
    /** Expand to active order via {@link seatActiveCol}; dedupes into a fresh Set (insertion order = active order). */
    private expandActiveCols;
    /** Stage a membership/order change of one col: mark the set for re-index at flush + record for dispatch. */
    protected stageColChange(col: AgColumn): void;
    /** {@link stageColChange} for several cols at once. */
    protected stageColChanges(changedCols: Iterable<AgColumn>): void;
    /** Record a col for the next {@link dispatchColChange} WITHOUT a re-index — for value-only changes that
     *  keep the active set/order unchanged (a `Set` dedupes the payload). */
    protected recordColChange(col: AgColumn): void;
    private pendingColChangeSet;
    /** Re-stamp active-col indexes once if a staged change moved the set; called by
     *  {@link ColumnModel.flushColChanges} before refresh/dispatch read the stamped positions. */
    flushReindex(): void;
    /** Dispatch this service's staged change (if any); called by {@link ColumnModel.flushColChanges}. */
    dispatchColChange(source: ColumnEventType): void;
    addColumns(keys: (ColKey | null | undefined)[] | undefined, source: ColumnEventType): void;
    removeColumns(keys: (ColKey | null | undefined)[] | undefined, source: ColumnEventType): void;
    private updateColList;
    /** Bucket one primary col for the pass; no-op if not in this role. `colIsNew` ⇒ `initial*` props apply. */
    abstract extractCol(col: AgColumn, colIsNew: boolean): void;
    /** Finalise the pass: order the buckets, diff vs the previous active cols (flagging changes), re-seat,
     *  then release the buckets. */
    commitExtract(source: ColumnEventType): void;
    /** Record a col's target order index for {@link sortByPendingState} and mark the pass dirty. */
    protected recordPendingStateOrder(col: AgColumn, index: number): void;
    /** Re-order + re-stamp active cols when this apply changed membership/order; else keep insertion order. */
    sortByPendingState(): void;
    protected sortPendingCols(cols: AgColumn[]): boolean;
    protected readonly compareByStateIndex: (a: AgColumn, b: AgColumn) => number;
    /** Apply one `ColumnState` entry to this service; ordered services share the impl, `valueColsSvc` overrides. */
    abstract syncColState(column: AgColumn, stateItem: ColumnState | null, defaultState: ColumnStateParams | undefined, source: ColumnEventType): void;
}
