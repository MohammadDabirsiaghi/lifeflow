import type { AgSparklineOptions } from 'ag-charts-types';
import type { LocaleTextFunc } from 'ag-stack';
type SparklineTranslate = (key: string, defaultValue: string, variableValues?: string[]) => string;
type SparklineNumberFormatter = (value: number) => string;
export declare const getChartTypeLabel: (translate: LocaleTextFunc, sparklineOptions?: AgSparklineOptions) => string;
interface SparklineSummary {
    count: number;
    min?: number;
    max?: number;
    start?: number;
    end?: number;
}
type SparklineTemplateValues = Record<string, string>;
export declare const getSparklineSummary: (data: any[], yKey: string) => SparklineSummary;
export declare function getSparklineAriaTemplate(params: {
    translate: SparklineTranslate;
    chartType: string;
    summary: SparklineSummary;
    formatNumber: SparklineNumberFormatter;
}): {
    template: string;
    values: SparklineTemplateValues;
};
export declare const interpolateTemplate: (template: string, values: SparklineTemplateValues) => string;
export {};
