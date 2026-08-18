import type { BeanCollection } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
import type { ChartMenuContext } from '../../chartMenuContext';
import type { FormatPanelOptions } from '../formatPanel';
export declare class LegendPanel extends Component {
    private readonly options;
    private chartTranslation;
    private readonly chartController;
    wireBeans(beans: BeanCollection): void;
    private readonly legendGroup;
    private enabledGroup;
    private readonly key;
    private readonly isGradient;
    constructor(options: FormatPanelOptions, chartMenuContext: ChartMenuContext);
    postConstruct(): void;
    private updateLegendEnabledState;
    private getItems;
    /**
     * The legend has no stroke width of its own, so left unset each marker takes the width the series it
     * belongs to renders with. The slider is chart-wide and can only show a width every marker agrees on.
     */
    private createMarkerStrokeSlider;
    private getRenderedMarkerStrokeWidths;
    /**
     * Item spacing is a single four-sided `padding` on the legend item, whereas the panel offers one
     * slider per axis, so each slider reads one side of the pair it owns and writes both.
     */
    private createItemPaddingSlider;
    private createLabelPanel;
}
