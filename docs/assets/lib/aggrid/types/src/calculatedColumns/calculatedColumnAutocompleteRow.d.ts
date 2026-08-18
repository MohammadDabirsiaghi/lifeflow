import { Component } from 'ag-grid-community';
import type { ColumnSuggestion } from './calculatedColumnFormTypes';
export declare class CalculatedColumnAutocompleteRow extends Component {
    private suggestion;
    private tooltipValue;
    private tooltipFeature?;
    constructor();
    postConstruct(): void;
    setState(suggestion: ColumnSuggestion, selected: boolean): void;
    updateSelected(selected: boolean): void;
    setSearchString(_searchString: string): void;
    private render;
    private isTruncated;
}
