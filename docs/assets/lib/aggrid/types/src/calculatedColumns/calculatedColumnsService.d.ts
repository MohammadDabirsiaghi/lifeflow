import type { AgColumn, ColumnEventType, ColumnState, ColumnTreeBuild, HeaderPosition, ICalculatedColumnsService, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
type CalculatedColumnDialogRestoreFocusParams = {
    eventSource?: HTMLElement;
    headerPosition: HeaderPosition | null;
};
export declare class CalculatedColumnsService extends BeanStub implements NamedBean, ICalculatedColumnsService {
    readonly beanName: "calculatedColsSvc";
    /** Dynamic calc cols (API/dialog added), keyed by colId. Insertion order = tree append order. */
    private readonly dynamicColumns;
    /** Added cols parked by `resetColumnState` so a later `applyColumnState` can restore them, by colId. */
    private readonly inactiveDynamicColumns;
    /** Highest `calculated_N` index handed out to this grid, so {@link createUniqueColId} never reuses one. */
    private lastCalculatedColIndex;
    private validationStatesByColId;
    private validationStatesInitialised;
    private lifecycleInitialised;
    private knownCalculatedColumns;
    private suppressValidationChecks;
    private readonly openDialogsByColId;
    private readonly scheduledLiveApplyColIds;
    private readonly pendingLiveApplyUpdatesByColId;
    private readonly formulaErrorsByExpression;
    private userColumnSvc;
    postConstruct(): void;
    isEnabled(): boolean;
    isHighlightedColumn(column: AgColumn | null): boolean;
    private refreshCalculatedColumnHighlight;
    private refreshOpenDialogHighlights;
    private updateCalculatedColumn;
    private getFormulaError;
    private getFormulaExpressionError;
    private validateFormulaExpression;
    private getInvalidColumnReference;
    private validateColumnReferences;
    openCalculatedColumnDialog(column: AgColumn | null | undefined, mode: 'add' | 'edit', focus?: boolean, restoreFocusParams?: CalculatedColumnDialogRestoreFocusParams): void;
    private addDynamicCalculatedColumn;
    removeCalculatedColumn(column: AgColumn | null | undefined): void;
    /** Records a created (API/dialog-added) calc col in the user-column layer. */
    private recordCreatedColumn;
    private isLiveApplyMode;
    private getOptions;
    /** Records the user's changes to a `columnDefs`-declared calc col in the user-column layer. Properties
     *  put back to the declared value are dropped, so reverting an edit persists nothing. */
    private setDeclaredColOverride;
    contributeTo(build: ColumnTreeBuild): void;
    private clearDynamicColumnInstances;
    resetDynamicColumnDefs(preserveCreatedColumns?: boolean): boolean;
    /** Takes ownership of restored user-column entries that describe calculated columns, so the dialog,
     *  removal and event paths treat them exactly like ones added in this session. Entries the layer no
     *  longer holds take their columns with them. */
    adoptUserColumns(): boolean;
    /** A leaf in `groupId` to append a restored column after, so it is built into that group. Only columns
     *  that survive the coming rebuild qualify: `colDefList` still holds the ones this restore dropped, and
     *  anchoring to one of those would strand the new column at the top level. */
    private findAnchorInGroup;
    restoreDynamicColumnDefs(state: ColumnState[]): boolean;
    private getOrCreateColumn;
    /** Rebuild the column tree for a calc-col mutation. Suppresses lifecycle/validation dispatch during the
     *  rebuild so the imperative caller (or column-state op) emits its own events, not duplicates. */
    refreshDynamicColumns(source: ColumnEventType): void;
    private createUniqueColId;
    private getUpdatedCalculatedColDef;
    private showDialog;
    private restoreFocusOnDialogClose;
    private scheduleLiveApplyUpdate;
    private flushLiveApplyUpdate;
    private cancelLiveApplyUpdate;
    private closeCalculatedColumnDialog;
    private getDefaultDraft;
    private getDataTypeOptions;
    private getValidConfiguredDataTypes;
    private getDataTypeDisplayName;
    private formatDataTypeName;
    private getExpressionPickers;
    private toDraft;
    private focusCalculatedColumn;
    private toColDef;
    private toCalculatedColDef;
    private getExpressionValidationState;
    private forEachCalculatedColumn;
    /** Fire created/expressionChanged/removed events for calc cols added, edited, or removed *declaratively*
     *  (via columnDefs). Imperative dialog paths rebuild through {@link refreshDynamicColumns} (counter > 0),
     *  so this stays silent for them and they dispatch inline — avoiding double-fire. The baseline is always
     *  updated (even when silent) so a later declarative load doesn't replay suppressed changes as new events. */
    private checkColumnLifecycle;
    private checkValidationStates;
    private getEventCommonParams;
    private dispatchCreatedOrRemovedEvent;
    private dispatchExpressionChangedEvent;
    private dispatchValidationStateChangedEvent;
    private getFunctionSuggestions;
    private refreshCalculatedColumn;
}
export {};
