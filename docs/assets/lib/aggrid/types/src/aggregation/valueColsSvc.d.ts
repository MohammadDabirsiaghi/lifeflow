import type { AgColumn, BeanCollection, ColAggFunc, ColKey, ColumnEventType, ColumnState, ColumnStateParams, IValueColsService, NamedBean } from 'ag-grid-community';
import { BaseColsService } from '../columns/baseColsService';
export declare class ValueColsSvc extends BaseColsService implements NamedBean, IValueColsService {
    beanName: "valueColsSvc";
    protected eventName: "columnValueChanged";
    private aggFuncSvc?;
    wireBeans(beans: BeanCollection): void;
    /** Value cols are included from a truthy aggFunc; `undefined` falls back to `initialAggFunc`
     *  (new cols) or the current flag (existing). Ordering is driven by `valueIndex`/`initialValueIndex`. */
    extractCol(col: AgColumn, colIsNew: boolean): void;
    /** Seat an included value col: indexed (`valueIndex`, or `initialValueIndex` for new cols) cols are
     *  sorted by `commitExtract`; the rest keep their prior/col-def order. */
    private bucketCol;
    protected onColActiveChanged(column: AgColumn, active: boolean): void;
    protected writeColActive(col: AgColumn, active: boolean, source: ColumnEventType): boolean;
    setColumnAggFunc(key: ColKey | undefined, aggFunc: ColAggFunc, source: ColumnEventType): void;
    syncColState(column: AgColumn, stateItem: ColumnState | null, defaultState: ColumnStateParams | undefined, source: ColumnEventType): void;
    /** Stamps each active col's position as its value-column order (`aggregationActiveIndex`, valid only when active). */
    protected onColumnsChanged(): void;
    /** Apply `aggFunc` to `column` and report what moved: {@link AGG_MEMBERSHIP} ((de)activation — the
     *  value-column set changed, so dependent pivot result columns must rebuild), {@link AGG_FUNC_ONLY} (func
     *  changed on an already-active col — re-aggregates event-driven), or {@link AGG_UNCHANGED}. */
    private applyAggFunc;
}
