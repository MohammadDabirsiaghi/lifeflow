import type { AgComponentSelector, AgCoreBeanCollection, BaseEvents, BaseProperties, IPropertiesService } from 'ag-stack';
import type { AgLabelParams, LabelAlignment, _AgWidgetSelectorType } from 'ag-grid-community';
import { AgAbstractLabel } from 'ag-grid-community';
export interface AgSliderParams extends AgLabelParams {
    minValue?: number;
    maxValue?: number;
    textFieldWidth?: number;
    step?: number;
    value?: string;
    onValueChange?: (newValue: number) => void;
}
type AgSliderEvent = 'fieldValueChanged';
export declare class AgSlider<TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>, TProperties extends BaseProperties, TGlobalEvents extends BaseEvents, TCommon, TPropertiesService extends IPropertiesService<TProperties, TCommon>, TComponentSelectorType extends string> extends AgAbstractLabel<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService, TComponentSelectorType, AgSliderParams, AgSliderEvent> {
    protected readonly eLabel: HTMLElement;
    private readonly eSlider;
    private readonly eText;
    protected labelAlignment: LabelAlignment;
    constructor(config?: AgSliderParams);
    postConstruct(): void;
    onValueChange(callbackFn: (newValue: number) => void): this;
    setSliderWidth(width: number): this;
    setTextFieldWidth(width: number): this;
    setMinValue(minValue: number): this;
    setMaxValue(maxValue: number): this;
    getValue(): string | null | undefined;
    setValue(value: string, silent?: boolean): this;
    setStep(step: number): this;
}
export declare const AgSliderSelector: AgComponentSelector<_AgWidgetSelectorType>;
export {};
