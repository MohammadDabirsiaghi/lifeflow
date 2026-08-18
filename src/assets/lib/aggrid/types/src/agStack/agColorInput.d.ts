import type { IColor } from 'ag-charts-types';
import type { AgComponentSelector, AgCoreBeanCollection, BaseEvents, BaseProperties, IPropertiesService } from 'ag-stack';
import type { AgInputTextFieldParams, _AgWidgetSelectorType } from 'ag-grid-community';
import { AgInputTextField } from 'ag-grid-community';
type AgColorInputEvent = 'colorChanged';
export declare class AgColorInput<TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>, TProperties extends BaseProperties, TGlobalEvents extends BaseEvents, TCommon, TPropertiesService extends IPropertiesService<TProperties, TCommon>, TComponentSelectorType extends string> extends AgInputTextField<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService, TComponentSelectorType, AgInputTextFieldParams<TComponentSelectorType>, AgColorInputEvent> {
    private color;
    wireBeans(beans: TBeanCollection): void;
    private readonly eColor;
    constructor();
    setColor(color: IColor): void;
    setValue(value?: string | null | undefined, silent?: boolean | undefined): this;
    onColorChanged(callback: (color: IColor) => void): void;
}
export declare const AgColorInputSelector: AgComponentSelector<_AgWidgetSelectorType>;
export {};
