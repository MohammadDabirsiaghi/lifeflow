import type { BeanCollection } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
import type { ChartMenuParamsFactory } from '../chartMenuParamsFactory';
interface Font {
    fontFamily?: string;
    fontStyle?: string;
    fontWeight?: string;
    fontSize?: number;
    color?: string;
}
export interface FontPanelParams {
    name?: string;
    enabled: boolean;
    suppressEnabledCheckbox?: boolean;
    onEnableChange?: (enabled: boolean) => void;
    chartMenuParamsFactory: ChartMenuParamsFactory;
    keyMapper: (key: string) => string;
    cssIdentifier?: string;
    /** Where the effective value for a font key lives when the label itself holds none. */
    fontValueWhenUnset?: <K extends keyof Font>(fontKey: K) => Font[K];
}
export declare class FontPanel extends Component {
    private readonly params;
    private chartTranslation;
    wireBeans(beans: BeanCollection): void;
    private readonly fontGroup;
    private readonly chartOptions;
    private readonly activeComps;
    constructor(params: FontPanelParams);
    postConstruct(): void;
    addItem(comp: Component<any>, prepend?: boolean): void;
    setEnabled(enabled: boolean): void;
    private getColorPickerParams;
    private getFamilySelectParams;
    private getSizeSelectParams;
    private getWeightStyleSelectParams;
    private destroyActiveComps;
    destroy(): void;
    private setFont;
    private getInitialFontValue;
}
export {};
