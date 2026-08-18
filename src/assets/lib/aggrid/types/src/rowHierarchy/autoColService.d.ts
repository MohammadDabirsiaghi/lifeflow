import type { ColumnEventType, IAutoColService, NamedBean, PropertyValueChangedEvent } from 'ag-grid-community';
import { AgColumn, BeanStub } from 'ag-grid-community';
export declare class AutoColService extends BeanStub implements NamedBean, IAutoColService {
    beanName: "autoColSvc";
    /** Generated auto-group columns; empty when no auto-cols are active. Wrappers around these
     *  leaves are built/destroyed by `colGroupSvc.serviceWrapperCache`. */
    columns: AgColumn[];
    /** Flips true on the first `modelUpdated` — used to detect the CSRM-no-rowData edge case
     *  where the modelUpdated hook (and therefore the visibility update) never fires. */
    private modelEverUpdated;
    postConstruct(): void;
    private setupGroupHideColumnsUntilExpanded;
    /** Generates or destroys auto-group columns based on grouping state. ColumnGroupService owns
     *  the balanced-tree wrappers and catches depth-only changes. */
    refreshCols(source: ColumnEventType): AgColumn[] | null;
    updateColumns(event: PropertyValueChangedEvent<'autoGroupColumnDef'>): void;
    destroy(): void;
    private destroyColumns;
    /** Reconcile the auto-col set to `rowGroupCols` (undefined ⇒ the single shared auto col): reuse existing
     *  instances by colId, create only genuinely new cols, and destroy only the ones no longer present. */
    private reconcileAutoCols;
    /** Reuse the existing auto col for `rowGroupCol` (refreshing its colDef + index) if present, else create it. */
    private reuseOrCreateAutoCol;
    private isSuppressAutoCol;
    private createOneAutoCol;
    /** Refreshes an auto group col to load changes from defaultColDef or autoGroupColDef */
    private updateOneAutoCol;
    private createAutoColDef;
    private applyDynamicSingleColumnTooltips;
    private createBaseColDef;
    private getDeepestExpandedLevel;
    /** Sets auto-col visibility flags for the "group hide columns until expanded" feature. When called
     *  mid-`refreshCols` (`canRefresh=false`), only the flags are set — the enclosing refresh assembles
     *  the new colsList and runs `visibleCols.refresh` itself, so refreshing here would run against the
     *  stale colsList and dispatch a premature `displayedColumnsChanged`. */
    private updateGroupColumnVisibility;
}
