import type { AgColumn, AgProvidedColumnGroup, DefaultColumnMenuItem, MenuItemDef, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
import { MenuList } from '../widgets/menuList';
export declare class ColumnMenuFactory extends BeanStub implements NamedBean {
    beanName: "colMenuFactory";
    createMenu(parent: {
        createManagedBean(bean: MenuList): MenuList;
    }, menuItems: (DefaultColumnMenuItem | MenuItemDef)[], column: AgColumn | undefined, sourceElement: () => HTMLElement, columnGroup?: AgProvidedColumnGroup): MenuList;
    getMenuItems(column?: AgColumn | null, columnGroup?: AgProvidedColumnGroup | null): (DefaultColumnMenuItem | MenuItemDef)[];
    private getDefaultMenuOptions;
}
