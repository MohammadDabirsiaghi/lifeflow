import type { BeanCollection } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
import type { FormatPanelOptions } from '../formatPanel';
export declare class PolarAxisPanel extends Component {
    private readonly options;
    private readonly axisGroup;
    private chartTranslation;
    wireBeans(beans: BeanCollection): void;
    constructor(options: FormatPanelOptions);
    postConstruct(): void;
    /** Only one of the polar axes carries `axisType`'s options, so reads and writes must target it alone. */
    private createSingleAxisParamsFactory;
    private initAxis;
    private initAxisLabels;
    private createOrientationWidget;
    private initRadiusAxis;
    private createSlider;
    private createSelect;
    private translate;
}
