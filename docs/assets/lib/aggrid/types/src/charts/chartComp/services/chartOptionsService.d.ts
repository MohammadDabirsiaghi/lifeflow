import type { AgCartesianAxesTheme, AgCartesianAxisOptions, AgChartOptions, AgChartThemeOverrides, AgPolarAxesTheme } from 'ag-charts-types';
import type { ChartType } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
import type { ChartController } from '../chartController';
import type { AgChartActual, AgChartAxisType } from '../utils/integration';
import type { ChartSeriesType } from '../utils/seriesTypeMapper';
export interface ChartOptionsProxy {
    getValue<T = string>(expression: string, calculated?: boolean): T;
    setValue<T = string>(expression: string, value: T): void;
    setValues<T = string>(properties: {
        expression: string;
        value: T;
    }[]): void;
    /** only used for chart options (not theme overrides) */
    clearValue?(parentExpression: string, key: string): void;
}
type ChartAxis = NonNullable<AgChartActual['axes']>[number];
type AgPolarAxisThemeOverrides = NonNullable<AgPolarAxesTheme[keyof AgPolarAxesTheme]>;
type AgCartesianAxisThemeOverrides = NonNullable<AgCartesianAxesTheme[keyof AgCartesianAxesTheme]>;
type AgChartAxisThemeOverrides = AgCartesianAxisThemeOverrides | AgPolarAxisThemeOverrides;
export declare class ChartOptionsService extends BeanStub {
    private readonly chartController;
    constructor(chartController: ChartController);
    getChartThemeOverridesProxy(): ChartOptionsProxy;
    getAxisThemeOverridesProxy(): ChartOptionsProxy;
    getCartesianAxisOptionsProxy(axisType: 'xAxis' | 'yAxis'): ChartOptionsProxy;
    getCartesianAxisThemeOverridesProxy(axisType: 'xAxis' | 'yAxis'): ChartOptionsProxy;
    getCartesianAxisAppliedThemeOverridesProxy(axisType: 'xAxis' | 'yAxis'): ChartOptionsProxy;
    /**
     * `scope` decides which axes a write lands on. Options both polar axes share - the axis line, the
     * labels - are written to every axis, so the control styles the chart as a whole. Options only one of
     * them has must be written to that axis alone, or AG Charts rejects the write on the other and warns.
     */
    getPolarAxisThemeOverridesProxy(axisType: 'angle' | 'radius', scope?: 'allAxes' | 'thisAxis'): ChartOptionsProxy;
    /** Which of the polar axes carries the categories, which is where the group padding options live. */
    getPolarCategoryAxisType(): 'angle' | 'radius' | undefined;
    getSeriesOptionsProxy(getSelectedSeries: () => ChartSeriesType): ChartOptionsProxy;
    /**
     * Determine the set of theme overrides that should be retained when transitioning from one chart type to another.
     */
    getPersistedChartThemeOverrides(existingChartOptions: AgChartOptions, existingAxes: ChartAxis[] | undefined, existingChartType: ChartType, targetChartType: ChartType): AgChartThemeOverrides;
    assignPersistedAxisOverrides(params: {
        existingAxes: ChartAxis[];
        retainedChartAxisThemeOverrideKeys: {
            expression: keyof AgChartAxisThemeOverrides | string;
            targetAxisTypes: AgChartAxisType[];
        }[];
        existingChartOptions: AgChartOptions;
        targetChartOptions: AgChartOptions;
        existingChartType: ChartType;
        targetChartType: ChartType;
    }): void;
    private getRetainedChartThemeOverrideKeys;
    private getRetainedChartAxisThemeOverrideKeys;
    private getRetainedCartesianAxisThemeOverrideKeys;
    private getChartOption;
    private readProcessed;
    private pickProcessedAxis;
    private setChartThemeOverrides;
    private applyChartOptions;
    awaitChartOptionUpdate(func: () => void): void;
    private getAxisProperty;
    private setAxisThemeOverrides;
    private setPolarAxisThemeOverrides;
    private getCartesianAxisProperty;
    private getPolarAxisProperty;
    private getCartesianAxisThemeOverride;
    private setCartesianAxisThemeOverrides;
    private setCartesianAxisOptions;
    private clearCartesianAxisOptions;
    private updateCartesianAxisOptions;
    setCartesianCategoryAxisType(axisType: 'xAxis' | 'yAxis', value: AgCartesianAxisOptions['type']): void;
    private getCartesianAxis;
    private getSeriesOption;
    private setSeriesOptions;
    getPairedMode(): boolean;
    setPairedMode(paired: boolean): void;
    private getChartAxes;
    private retrieveChartAxisThemeOverride;
    private assignChartAxisThemeOverride;
    private isValidAxisType;
    getChartType(): ChartType;
    private getChart;
    private updateChart;
    private createChartOptions;
    private retrieveChartOptionsThemeOverride;
    private assignChartOptionsThemeOverride;
    private retrieveChartOptionsSeriesThemeOverride;
    private assignChartOptionsSeriesThemeOverride;
    private getChartThemeOverridesSeriesTypeKeys;
    private retrieveChartOption;
    private assignChartOption;
    private clearChartOption;
    private raiseChartOptionsChangedEvent;
}
export {};
