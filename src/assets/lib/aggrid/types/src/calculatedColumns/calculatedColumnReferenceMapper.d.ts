import type { AgColumn, BeanCollection } from 'ag-grid-community';
import type { ColumnSuggestion } from './calculatedColumnFormTypes';
interface CalculatedColumnReferenceError {
    type: 'unknown' | 'ambiguous';
    reference: string;
}
export interface CalculatedColumnReferenceMapper {
    suggestions: ColumnSuggestion[];
    toInternalExpression(expression: string): {
        expression: string;
    } | {
        error: CalculatedColumnReferenceError;
    };
    toInternalExpressionBestEffort(expression: string): string;
    toDisplayExpression(expression: string): string;
}
type TranslateFn = (key: string, defaultValue: string, variableValues?: string[]) => string;
export declare function translateCalculatedColumnReferenceError(error: CalculatedColumnReferenceError, translate: TranslateFn): string;
export declare function createCalculatedColumnReferenceMapper(beans: BeanCollection, columns: AgColumn[], excludedColId: string): CalculatedColumnReferenceMapper;
export {};
