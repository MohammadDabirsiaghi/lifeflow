import type { RowCtrl, RowGroupOpenedEvent, RowNode } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
export declare abstract class BaseExpansionService extends BeanStub {
    protected abstract dispatchExpandedEvent(event: RowGroupOpenedEvent, forceSync?: boolean): void;
    addExpandedCss(classes: string[], rowNode: RowNode): void;
    getRowExpandedListeners(rowCtrl: RowCtrl): {
        expandedChanged: () => void;
        hasChildrenChanged: () => void;
    };
    setExpanded(rowNode: RowNode, expanded: boolean, e?: MouseEvent | KeyboardEvent, forceSync?: boolean): void;
    defaultExpanded(rowNode: RowNode): boolean;
    isExpandable(rowNode: RowNode): boolean;
    /** Shared expandability rule; callers pass hasChildren() for "expandable now" or the group flag for "could ever expand". */
    protected checkExpandable(rowNode: RowNode, hasChildren: boolean): boolean;
    private updateExpandedCss;
    protected dispatchStateUpdatedEvent(): void;
}
