import type { AgColumn, AgProvidedColumnGroup, ColumnEventType, DefaultColumnMenuItem, GetNoteParams, MenuItemDef, NamedBean, RowNode } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
export declare class MenuItemMapper extends BeanStub implements NamedBean {
    beanName: "menuItemMapper";
    mapWithStockItems(originalList: (DefaultColumnMenuItem | MenuItemDef)[], column: AgColumn | null, node: RowNode | null, noteParams: GetNoteParams | undefined, sourceElement: () => HTMLElement, source: ColumnEventType, columnGroup?: AgProvidedColumnGroup | null): (MenuItemDef | 'separator')[];
}
