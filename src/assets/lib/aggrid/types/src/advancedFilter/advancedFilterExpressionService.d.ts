import type { AgColumn, BaseCellDataType, BeanCollection, ColumnAdvancedFilterModel, JoinAdvancedFilterModel, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
import { ADVANCED_FILTER_LOCALE_TEXT } from './advancedFilterLocaleText';
import type { AutocompleteEntry, AutocompleteListParams } from './autocomplete/autocompleteParams';
import type { DataTypeFilterExpressionOperators, FilterExpressionEvaluatorParams, FilterExpressionOperator, FilterExpressionOperators } from './filterExpressionOperators';
export declare class AdvancedFilterExpressionService extends BeanStub implements NamedBean {
    beanName: "advFilterExpSvc";
    private valueSvc;
    private colModel;
    private colNames;
    private dataTypeSvc?;
    private readonly filterOperandGetters;
    private readonly operandModelValueGetters;
    wireBeans(beans: BeanCollection): void;
    private columnNameToIdMap;
    private columnAutocompleteEntries;
    private expressionOperators;
    private expressionJoinOperators;
    private expressionEvaluatorParams;
    postConstruct(): void;
    parseJoinOperator(model: JoinAdvancedFilterModel): string;
    getColumnDisplayValue(model: ColumnAdvancedFilterModel): string | undefined;
    getOperatorDisplayValue(model: ColumnAdvancedFilterModel): string | undefined;
    getOperandModelValue(operand: string, baseCellDataType: BaseCellDataType, column: AgColumn): string | number | null;
    /**
     * Whether a stored operand is itself valid input for its data type, i.e. whether feeding the model
     * value back into the expression or the builder editor yields the same value again.
     *
     * True for most types: text and number model values are their input form, and dates store the iso
     * string the editor expects. It is false only for `bigint`, where the model holds the canonical
     * decimal while input goes through the column's `bigintParser` - so a parser reading a non-decimal
     * syntax would reinterpret that decimal as a different number. Those operands have to be presented
     * through `getOperandDisplayValue` (the `bigintFormatter`) or kept as the text the user typed.
     */
    isOperandModelValueEditable(baseCellDataType: BaseCellDataType): boolean;
    getOperandDisplayValue(model: ColumnAdvancedFilterModel, skipFormatting?: boolean): string;
    parseColumnFilterModel(model: ColumnAdvancedFilterModel): string;
    updateAutocompleteCache(updateEntry: AutocompleteEntry, type?: string): void;
    translate(key: keyof typeof ADVANCED_FILTER_LOCALE_TEXT, variableValues?: string[]): string;
    generateAutocompleteListParams(entries: AutocompleteEntry[], type: string, searchString: string): AutocompleteListParams;
    getColumnAutocompleteEntries(): AutocompleteEntry[];
    getOperatorAutocompleteEntries(column: AgColumn, baseCellDataType: BaseCellDataType): AutocompleteEntry[];
    getJoinOperatorAutocompleteEntries(): AutocompleteEntry[];
    getDefaultAutocompleteListParams(searchString: string): AutocompleteListParams;
    getDataTypeExpressionOperator(baseCellDataType?: BaseCellDataType): DataTypeFilterExpressionOperators<any> | undefined;
    getExpressionOperator(baseCellDataType?: BaseCellDataType, operator?: string): FilterExpressionOperator<any> | undefined;
    getExpressionJoinOperators(): {
        AND: string;
        OR: string;
    };
    getColId(columnName: string): {
        colId: string;
        columnName: string;
    } | null;
    getExpressionEvaluatorParams<ConvertedTValue, TValue = ConvertedTValue>(colId: string): FilterExpressionEvaluatorParams<ConvertedTValue, TValue>;
    getColumnDetails(colId: string): {
        column?: AgColumn;
        baseCellDataType: BaseCellDataType;
    };
    generateExpressionOperators(): FilterExpressionOperators;
    getColumnValue({ displayValue }: AutocompleteEntry): string;
    private generateExpressionJoinOperators;
    private getActiveOperators;
    resetColumnCaches(): void;
}
