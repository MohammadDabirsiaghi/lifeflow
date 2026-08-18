import type { AgCoreBeanCollection, BaseEvents, BaseProperties, IPropertiesService } from 'ag-stack';
import { AgTabGuardComp } from 'ag-stack';
import type { IComponent } from 'ag-grid-community';
export declare class AgMenuPanel<TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>, TProperties extends BaseProperties, TGlobalEvents extends BaseEvents, TCommon, TPropertiesService extends IPropertiesService<TProperties, TCommon>, TComponentSelectorType extends string> extends AgTabGuardComp<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService, TComponentSelectorType> {
    constructor(wrappedComponent: IComponent<any>);
    postConstruct(): void;
    private handleKeyDown;
    private onTabKeyDown;
    private closePanel;
}
