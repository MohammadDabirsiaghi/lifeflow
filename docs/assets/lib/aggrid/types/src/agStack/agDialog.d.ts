import type { AgCoreBeanCollection, BaseEvents, BaseProperties, IPropertiesService, ResizableStructure, StopPropagationCallbacks } from 'ag-stack';
import type { AgPanelOptions, AgPanelPostProcessPopupParams } from './agPanel';
import { AgPanel } from './agPanel';
export interface AgDialogOptions<TBeanCollection, TProperties extends BaseProperties, TGlobalEvents extends BaseEvents, TPanelPostProcessPopupParams extends AgPanelPostProcessPopupParams = AgPanelPostProcessPopupParams> extends AgPanelOptions<TBeanCollection, TProperties, TGlobalEvents, TPanelPostProcessPopupParams> {
    eWrapper?: HTMLElement;
    modal?: boolean;
    movable?: boolean;
    alwaysOnTop?: boolean;
    maximizable?: boolean;
    afterGuiAttached?: () => void;
    closedCallback?: (event?: MouseEvent | TouchEvent | KeyboardEvent) => void;
}
export interface AgDialogCallbacks<TBeanCollection, TDialog> {
    stopPropagationCallbacks: StopPropagationCallbacks;
    focusNextContainer(beans: TBeanCollection, backwards: boolean): boolean;
    configureFocusableContainer(beans: TBeanCollection, dialog: TDialog): void;
}
export declare class AgDialog<TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>, TProperties extends BaseProperties, TGlobalEvents extends BaseEvents, TCommon, TPropertiesService extends IPropertiesService<TProperties, TCommon>, TComponentSelectorType extends string, TDialogOptions extends AgDialogOptions<TBeanCollection, TProperties, TGlobalEvents, AgPanelPostProcessPopupParams> = AgDialogOptions<TBeanCollection, TProperties, TGlobalEvents, AgPanelPostProcessPopupParams>> extends AgPanel<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService, TComponentSelectorType, TDialogOptions> {
    private readonly callbacks?;
    private popupSvc?;
    wireBeans(beans: TBeanCollection): void;
    private tabGuardFeature;
    private isMaximizable;
    private isMaximized;
    private readonly maximizeListeners;
    private maximizeButtonComp;
    private maximizeIcon;
    private minimizeIcon;
    private resizeListenerDestroy;
    private readonly lastPosition;
    constructor(config: TDialogOptions, callbacks?: AgDialogCallbacks<TBeanCollection, AgDialog<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService, TComponentSelectorType, TDialogOptions>> | undefined);
    postConstruct(): void;
    setAllowFocus(allowFocus: boolean): void;
    protected renderComponent(): void;
    private onClosed;
    setMaximized(maximized: boolean): void;
    private toggleMaximize;
    private refreshMaximizeIcon;
    private clearMaximizebleListeners;
    destroy(): void;
    setResizable(resizable: boolean | ResizableStructure): void;
    setMovable(movable: boolean): void;
    setMaximizable(maximizable: boolean): void;
    private buildMaximizeAndMinimizeElements;
}
