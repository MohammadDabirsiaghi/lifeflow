import type { AgColumn, AgProvidedColumnGroup, IColumnHeaderEditService, MenuItemDef, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
type EditTarget = AgColumn | AgProvidedColumnGroup;
export declare class ColumnHeaderEditService extends BeanStub implements NamedBean, IColumnHeaderEditService {
    beanName: "colHeaderEditSvc";
    private activePopup;
    private removePopupColListener;
    private editingTarget;
    private getOptions;
    isLiveApplyMode(): boolean;
    private isHighlightSuppressed;
    isHighlightedColumn(column: AgColumn): boolean;
    isHighlightedGroup(columnGroup: AgProvidedColumnGroup): boolean;
    private setEditingTarget;
    private dispatchHighlightChanged;
    isEditable(target: EditTarget): boolean;
    private getEditableHeaderName;
    private applyHeaderName;
    postConstruct(): void;
    getEditColumnNameMenuItem(target: EditTarget): MenuItemDef | null;
    showHeaderNameEditor(target: EditTarget): void;
    private destroyActivePopup;
    destroy(): void;
}
export {};
