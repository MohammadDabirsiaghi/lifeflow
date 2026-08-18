import type { AgCoreBeanCollection, BaseEvents, BaseProperties, IPropertiesService } from 'ag-stack';
import { AgComponentStub } from 'ag-stack';
import type { IMenuItem } from 'ag-grid-community';
import type { AgMenuItemParams } from './agMenuItemComponent';
interface AgMenuItemRendererParams {
    cssClassPrefix?: string;
    isCompact?: boolean;
}
export declare class AgMenuItemRenderer<TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>, TProperties extends BaseProperties, TGlobalEvents extends BaseEvents, TCommon, TPropertiesService extends IPropertiesService<TProperties, TCommon>, TComponentSelectorType extends string, TMenuActionParams extends TCommon> extends AgComponentStub<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService, TComponentSelectorType> implements IMenuItem {
    private readonly callbacks?;
    private params;
    private cssClassPrefix;
    constructor(callbacks?: {
        warnNoIcon?: () => void;
    } | undefined);
    init(params: AgMenuItemParams<TMenuActionParams, TCommon> & AgMenuItemRendererParams): void;
    configureDefaults(): boolean;
    private addAriaAttributes;
    private addIcon;
    private addName;
    private addShortcut;
    private addSubMenu;
    private getClassName;
}
export {};
