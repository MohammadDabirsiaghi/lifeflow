import type { AgComponentSelector, AgCoreBeanCollection, BaseEvents, BaseProperties, IPropertiesService } from 'ag-stack';
import type { AgInputFieldParams, _AgWidgetSelectorType } from 'ag-grid-community';
import { AgAbstractInputField } from 'ag-grid-community';
export interface AgInputRangeParams<TComponentSelectorType extends string> extends AgInputFieldParams<TComponentSelectorType> {
    min?: number;
    max?: number;
    step?: number;
}
export declare class AgInputRange<TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>, TProperties extends BaseProperties, TGlobalEvents extends BaseEvents, TCommon, TPropertiesService extends IPropertiesService<TProperties, TCommon>, TComponentSelectorType extends string> extends AgAbstractInputField<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService, TComponentSelectorType, HTMLInputElement, string, AgInputRangeParams<TComponentSelectorType>> {
    private min;
    private max;
    constructor(config?: AgInputRangeParams<TComponentSelectorType>);
    postConstruct(): void;
    protected addInputListeners(): void;
    setMinValue(value: number): this;
    setMaxValue(value: number): this;
    setStep(value: number): this;
    setValue(value: string, silent?: boolean): this;
}
export declare const AgInputRangeSelector: AgComponentSelector<_AgWidgetSelectorType>;
