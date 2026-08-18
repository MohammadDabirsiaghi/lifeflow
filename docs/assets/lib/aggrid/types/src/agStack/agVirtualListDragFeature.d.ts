import type { AgComponent, AgCoreBeanCollection, BaseEvents, BaseProperties, IPropertiesService } from 'ag-stack';
import { AgBeanStub } from 'ag-stack';
import type { AgEvent } from 'ag-grid-community';
import type { AgVirtualList } from './agVirtualList';
import type { AgVirtualListDragParams } from './iVirtualListDragFeature';
export declare class AgVirtualListDragFeature<TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>, TProperties extends BaseProperties, TGlobalEvents extends BaseEvents, TCommon, TPropertiesService extends IPropertiesService<TProperties, TCommon>, TDragSourceType extends number, TParentComponent extends AgComponent<TBeanCollection, TProperties, TGlobalEvents, any>, TChildComponent extends AgComponent<TBeanCollection, TProperties, TGlobalEvents, any>, TDragValue, TDragStartEvent extends AgEvent, TDragEndEvent extends AgEvent> extends AgBeanStub<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService> {
    private readonly comp;
    private readonly virtualList;
    private readonly params;
    private currentDragValue;
    private lastHoveredListItem;
    private autoScrollService;
    private moveBlocked;
    constructor(comp: TParentComponent, virtualList: AgVirtualList<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService, any>, params: AgVirtualListDragParams<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService, TDragSourceType, TParentComponent, TChildComponent, TDragValue, TDragStartEvent, TDragEndEvent>);
    postConstruct(): void;
    private listItemDragStart;
    private listItemDragEnd;
    private createDropTarget;
    private createAutoScrollService;
    private onDragging;
    private getListDragItem;
    private onDragStop;
    private onDragCancel;
    private onDragLeave;
    private clearDragProperties;
    private clearHoveredItems;
}
