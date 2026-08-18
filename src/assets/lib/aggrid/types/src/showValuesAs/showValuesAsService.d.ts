import type { LocaleTextFunc } from 'ag-stack';
import type { AgColumn, BeanCollection, ChangedPath, ColDef, ColumnEventType, ColumnState, ColumnStateParams, IRowNode, IShowValuesAsService, MenuItemDef, NamedBean, RowNode, ShowValuesAs, ShowValuesAsResult, ShowValuesAsStateValue, ShowValuesAsType } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
/** Resolves a column's "Show Values As" mode and transforms its raw value into the value to display. */
export declare class ShowValuesAsService extends BeanStub implements NamedBean, IShowValuesAsService {
    beanName: "showValuesAsSvc";
    private colModel;
    private rowRenderer;
    private gridApi;
    private gridOptions;
    private groupStage?;
    private pivotResultCols?;
    private valueColsSvc?;
    private dataTypeSvc?;
    /** The built-in mode definitions, built once on first use (a grid that never resolves a column never pays).
     *  Read via {@link builtinModes}. Indexing yields `undefined` for an unknown (user-defined) mode name. */
    private cachedBuiltinModes;
    /** The built-in modes already resolved (merged + formatter), shared by every column that doesn't override
     *  them — their resolution is invariant for the grid, so it runs once not per column. Read via
     *  {@link resolvedBuiltinModes}. */
    private cachedResolvedBuiltinModes;
    private displayedColsKey;
    private displayedActiveResult;
    wireBeans(beans: BeanCollection): void;
    postConstruct(): void;
    destroy(): void;
    /** Resolve the column's config (all modes, once) and active mode from the colDef. `applyInitial` is true only
     *  at column creation: `initialShowValuesAs` is create-only, so on a later colDef change only an explicit
     *  `showValuesAs` may move the active mode — with neither, the mode the user/state applied is left untouched.
     *  Cold path (column create / colDef change), never per-cell. */
    resolveColumn(column: AgColumn, applyInitial: boolean): void;
    colDefSelection(colDef: ColDef): ShowValuesAsStateValue;
    /** Built-in mode definitions, built once on first use. */
    private get builtinModes();
    /** The built-in modes resolved once (deep-merged + formatter) — shared by every column that doesn't override
     *  them, since their resolution doesn't depend on the column. In their canonical (definition) order. */
    private get resolvedBuiltinModes();
    /** Resolve the column's config on demand — for a state/menu-applied mode the colDef didn't pre-resolve. */
    private ensureConfig;
    /** Build the column's resolved config: the shared built-in modes plus, only when the column declares
     *  `showValuesAsDef.modes`, a deep-merge of its overrides (a builtin gains/changes fields, `false`/`null`
     *  removes it, or a new mode is added). The built-ins are resolved once (see {@link resolvedBuiltinModes}). */
    private resolveConfig;
    /** Resolve one mode from its built-in base and the column's override entry (`colDef.showValuesAsDef.modes`),
     *  or `null` when disabled (`false`/`null`) or unknown (neither side provides a def). */
    private resolveMode;
    /** Sole writer of `column.showValuesAs`. Drops the displayed-active scan cache (and its column references, so a
     *  destroyed column is never retained) when the active set toggles. */
    private setActive;
    /** Sets `column.showValuesAs` (the active mode) from a lookup into the resolved config + the selector params.
     *  An unknown/disabled mode resolves to no active mode (the column stays enabled, just nothing applied). */
    private applyActive;
    /** Serialises a column's active mode to column state: the bare mode name when there is nothing else to
     *  preserve, else `{ type, params, precision }` — keeping a per-selection `precision` (one that differs from
     *  the config default) so it survives a round-trip. `null` when there is no mode. */
    toColState(column: AgColumn): ShowValuesAsStateValue;
    isApplying(column: AgColumn): boolean;
    /** The currently-displayed columns with an active mode — for the refresh sweep. Cached by the displayed-column
     *  array ref ({@link VisibleColsService.allCols}, reassigned whenever columns change, so a removed column drops
     *  out); {@link setActive} drops the cache when the active set changes. */
    private getDisplayedActiveCols;
    /** Refresh the Show Values As cells across every rendered row — for a general view refresh, where any row's
     *  aggregate-derived value may be stale (recycled DOM, or rendered before aggregation settled). Change-detected
     *  (`force: false`), so only moved values repaint, honouring each column's `enableCellChangeFlash`. */
    refreshRenderedCells(): void;
    /** Refresh the Show Values As cells in the rendered rows the caller did NOT already refresh — for the post-edit
     *  re-aggregation, where `nodes`/`path` identify the rows the change-detection flush refreshed (they flash their
     *  own moved cells). Row membership is O(1) via the `Set`/`ChangedPath`; `refreshCells` can't express the
     *  exclusion, so this walks each remaining row's cells once, refreshing those on an active column directly. */
    refreshRenderedCellsExcept(nodes: Set<RowNode> | null, path: ChangedPath | null): void;
    transform(column: AgColumn, rowNode: IRowNode, rawValue: any): ShowValuesAsResult | null;
    formatValue(column: AgColumn, rowNode: IRowNode | null, transformedValue: any, rawValue: any, notApplicable: boolean): string | null;
    syncColState(column: AgColumn, stateItem: ColumnState | null, defaultState: ColumnStateParams | undefined, source: ColumnEventType): void;
    getActiveModeLabel(column: AgColumn): string | null;
    isMenuEligible(column: AgColumn): boolean;
    getMenuItems(column: AgColumn, localeTextFunc: LocaleTextFunc): MenuItemDef[];
    /** The column-menu item for one mode, or `null` when it should be omitted (not applicable and not the active
     *  selection). `getColumnLists` lazily builds the candidate columns shared across the modes' submenus. */
    private buildModeMenuItem;
    /** Tooltip for a mode: its label and the calculation it performs — shared by the menu and header indicator.
     *  `displayName`/`description` resolve their callback form per call (so a built-in follows a runtime locale
     *  change), else are used verbatim. */
    private modeTooltip;
    getActiveModeTooltip(column: AgColumn): string | null;
    setColumnShowValuesAs(column: AgColumn, selection: ShowValuesAsType | ShowValuesAs | null): void;
    /** Propagate a mode change to the grid. A mode needing an aggregated total on a not-yet-aggregated column
     *  promotes it to a value column (which re-aggregates). Otherwise just redraw the cells: a total mode reads the
     *  root aggregate on demand via the transform params (which aggregates the root lazily), so no re-agg here. */
    private applyModeChangeEffects;
    /** Promote a not-yet-aggregated column to a value column (the mode's `defaultAggFunc`) when its active mode
     *  needs an aggregated total. No-op (returns `false`) when not needed or already a
     *  value column / pivoting. Triggers a one-time re-aggregation. */
    private promoteToValueColumn;
    private buildApplicabilityParams;
}
