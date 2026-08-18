import type { AfterGuiAttachedParams, AgCoreBeanCollection, BaseEvents, BaseProperties, IPropertiesService } from 'ag-stack';
import { AgTabGuardComp } from 'ag-stack';
import type { AgTabbedItem, AgTabbedLayoutParams } from './iTabbedLayout';
export declare class AgTabbedLayout<TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>, TProperties extends BaseProperties, TGlobalEvents extends BaseEvents, TCommon, TPropertiesService extends IPropertiesService<TProperties, TCommon>, TComponentSelectorType extends string, TContainerType extends string = string> extends AgTabGuardComp<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService, TComponentSelectorType> {
    private readonly eHeader;
    private readonly eBody;
    private eTabHeader;
    private eCloseButton?;
    private readonly params;
    private afterAttachedParams;
    private readonly items;
    private activeItem;
    private lastScrollListener;
    private readonly tabbedItemScrollMap;
    constructor(params: AgTabbedLayoutParams<TContainerType>);
    postConstruct(): void;
    private setupHeader;
    private setupCloseButton;
    protected handleKeyDown(e: KeyboardEvent): void;
    protected onTabKeyDown(e: KeyboardEvent): void;
    private focusInnerElement;
    focusHeader(preventScroll?: boolean): void;
    private focusBody;
    setAfterAttachedParams(params: AfterGuiAttachedParams<TContainerType>): void;
    showFirstItem(): void;
    private addItem;
    showItem(tabbedItem: AgTabbedItem<TContainerType>): void;
    private showItemWrapper;
}
