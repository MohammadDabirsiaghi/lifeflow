import type { AgColumn, ColumnEventType, IRowGroupColsService, NamedBean } from 'ag-grid-community';
import { OrderedColsService } from '../columns/orderedColsService';
export declare class RowGroupColsSvc extends OrderedColsService implements NamedBean, IRowGroupColsService {
    beanName: "rowGroupColsSvc";
    protected eventName: "columnRowGroupChanged";
    protected enableProp: "rowGroup";
    protected indexProp: "rowGroupIndex";
    protected initialEnableProp: "initialRowGroup";
    protected initialIndexProp: "initialRowGroupIndex";
    private readonly pendingVisibilityChanges;
    moveColumn(fromIndex: number, toIndex: number, source: ColumnEventType): void;
    protected onColActiveChanged(column: AgColumn, active: boolean, source: ColumnEventType): void;
    protected onColActiveChangesComplete(source: ColumnEventType): void;
    protected setActiveFlag(col: AgColumn, active: boolean): boolean;
    /** Stamps each active col's position as its row-group level (`rowGroupActiveIndex`, valid only when active). */
    protected onColumnsChanged(): void;
}
