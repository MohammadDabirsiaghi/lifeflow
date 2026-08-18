import type { AgCoreBeanCollection, BaseEvents, BaseProperties, IPropertiesService, WithoutCommon } from 'ag-stack';
import { AgBeanStub } from 'ag-stack';
import type { AgMenuItemCallbacks, AgMenuItemDef } from './agMenuItemComponent';
export interface AgContextMenuServiceParams<TBeanCollection, TCommon, TMenuActionParams extends TCommon, TDefaultMenuItem extends string> {
    menuItemCallbacks: AgMenuItemCallbacks<TBeanCollection, TMenuActionParams, TCommon>;
    getMenuItems(menuActionParams: WithoutCommon<TCommon, TMenuActionParams>, mouseEvent: MouseEvent | Touch): (TDefaultMenuItem | AgMenuItemDef<TMenuActionParams, TCommon>)[] | Promise<(TDefaultMenuItem | AgMenuItemDef<TMenuActionParams, TCommon>)[]> | undefined;
    mapMenuItems?(menuItems: (TDefaultMenuItem | AgMenuItemDef<TMenuActionParams, TCommon>)[], menuActionParams: WithoutCommon<TCommon, TMenuActionParams>, getGui: () => HTMLElement): (TDefaultMenuItem | AgMenuItemDef<TMenuActionParams, TCommon>)[];
    shouldBlockMenuOpen?(): boolean;
    beforeMenuOpen?(menuActionParams: WithoutCommon<TCommon, TMenuActionParams>): void;
    onMenuOpen?(): void;
    onMenuClose?(): void;
    afterMenuDestroyed?(): void;
    onVisibleChanged?(visible: boolean, source: 'api' | 'ui'): void;
}
export declare class AgContextMenuService<TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>, TProperties extends BaseProperties, TGlobalEvents extends BaseEvents, TCommon, TPropertiesService extends IPropertiesService<TProperties, TCommon>, TComponentSelectorType extends string, TMenuActionParams extends TCommon, TDefaultMenuItem extends string> extends AgBeanStub<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService> {
    private readonly params;
    private destroyLoadingSpinner;
    private lastPromise;
    private activeMenu;
    constructor(params: AgContextMenuServiceParams<TBeanCollection, TCommon, TMenuActionParams, TDefaultMenuItem>);
    hideActiveMenu(): void;
    showMenu(menuActionParams: WithoutCommon<TCommon, TMenuActionParams>, mouseEvent: MouseEvent | Touch, anchorToElement?: HTMLElement): boolean;
    private createLoadingIcon;
    private createContextMenu;
    destroy(): void;
}
