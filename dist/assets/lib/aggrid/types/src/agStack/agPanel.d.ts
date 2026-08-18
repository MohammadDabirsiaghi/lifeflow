import type { AgComponent, AgCoreBeanCollection, BaseEvents, BaseProperties, IPropertiesService, PositionableOptions, ResizableStructure } from 'ag-stack';
import { AgComponentStub, AgPositionableFeature } from 'ag-stack';
export interface AgPanelPostProcessPopupParams {
    type: string;
    eventSource?: HTMLElement | null;
    mouseEvent?: MouseEvent | Touch | null;
}
export interface AgPanelOptions<TBeanCollection, TProperties extends BaseProperties, TGlobalEvents extends BaseEvents, TPanelPostProcessPopupParams extends AgPanelPostProcessPopupParams = AgPanelPostProcessPopupParams> extends PositionableOptions {
    component?: AgComponent<TBeanCollection, TProperties, TGlobalEvents, any>;
    hideTitleBar?: boolean | null;
    closable?: boolean | null;
    resizable?: boolean | ResizableStructure;
    title?: string | null;
    cssIdentifier?: string | null;
    postProcessPopupParams?: TPanelPostProcessPopupParams;
}
export declare class AgPanel<TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>, TProperties extends BaseProperties, TGlobalEvents extends BaseEvents, TCommon, TPropertiesService extends IPropertiesService<TProperties, TCommon>, TComponentSelectorType extends string, TConfig extends AgPanelOptions<TBeanCollection, TProperties, TGlobalEvents, AgPanelPostProcessPopupParams> = AgPanelOptions<TBeanCollection, TProperties, TGlobalEvents, AgPanelPostProcessPopupParams>> extends AgComponentStub<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService, TComponentSelectorType> {
    protected readonly config: TConfig;
    protected closable: boolean;
    protected closeButtonComp: AgComponent<TBeanCollection, TProperties, TGlobalEvents, any> | undefined;
    protected positionableFeature: AgPositionableFeature<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService>;
    close: () => void;
    protected readonly eContentWrapper: HTMLElement;
    protected readonly eTitleBar: HTMLElement;
    protected readonly eTitleBarButtons: HTMLElement;
    protected readonly eTitle: HTMLElement;
    constructor(config: TConfig);
    postConstruct(): void;
    protected renderComponent(): void;
    getHeight(): number | undefined;
    setHeight(height: number | string): void;
    getWidth(): number | undefined;
    get isResizing(): boolean;
    setWidth(width: number | string): void;
    setClosable(closable: boolean): void;
    setBodyComponent(bodyComponent: AgComponent<TBeanCollection, TProperties, TGlobalEvents, any>): void;
    addTitleBarButton(button: AgComponent<TBeanCollection, TProperties, TGlobalEvents, any>, position?: number): void;
    getBodyHeight(): number;
    getBodyWidth(): number;
    setTitle(title: string): void;
    private onBtClose;
    destroy(): void;
}
