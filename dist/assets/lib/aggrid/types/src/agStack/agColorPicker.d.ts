import type { AgComponentSelector, AgCoreBeanCollection, BaseEvents, BaseProperties, IPropertiesService } from 'ag-stack';
import type { AgPickerFieldParams, _AgWidgetSelectorType } from 'ag-grid-community';
import { AgPickerField } from 'ag-grid-community';
import type { AgDialogCallbacks } from './agDialog';
import { AgDialog } from './agDialog';
export interface AgColorPickerParams<TComponentSelectorType extends string> extends Omit<AgPickerFieldParams<TComponentSelectorType>, 'pickerType' | 'pickerAriaLabelKey' | 'pickerAriaLabelValue'> {
    pickerType?: string;
    pickerAriaLabelKey?: string;
    pickerAriaLabelValue?: string;
    dialogCallbacks?: AgDialogCallbacks<any, any>;
}
export declare class AgColorPicker<TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>, TProperties extends BaseProperties, TGlobalEvents extends BaseEvents, TCommon, TPropertiesService extends IPropertiesService<TProperties, TCommon>, TComponentSelectorType extends string> extends AgPickerField<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService, TComponentSelectorType, string, AgColorPickerParams<TComponentSelectorType> & AgPickerFieldParams<TComponentSelectorType>, string, AgDialog<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService, TComponentSelectorType>> {
    private isDestroyingPicker;
    private eDisplayFieldColor;
    private eDisplayFieldText;
    constructor(config?: AgColorPickerParams<TComponentSelectorType>);
    postConstruct(): void;
    protected createPickerComponent(): AgDialog<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService, TComponentSelectorType, import("./agDialog").AgDialogOptions<TBeanCollection, TProperties, TGlobalEvents, import("./agPanel").AgPanelPostProcessPopupParams>>;
    protected renderAndPositionPicker(): () => void;
    setValue(color: string): this;
    getValue(): string;
}
export declare const AgColorPickerSelector: AgComponentSelector<_AgWidgetSelectorType>;
