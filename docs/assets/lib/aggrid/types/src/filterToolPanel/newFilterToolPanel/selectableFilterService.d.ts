import type { AgColumn, IFilterDef, ISelectableFilterService, NamedBean, SelectableFilterDef, SelectableFilterState, ValueGetterFunc } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
export declare class SelectableFilterService extends BeanStub<'selectedFilterChanged'> implements ISelectableFilterService, NamedBean {
    readonly beanName: "selectableFilter";
    private readonly selectedFilters;
    private readonly valueGetters;
    postConstruct(): void;
    getFilterValueGetter(colId: string): string | ValueGetterFunc | undefined;
    isSelectable(filterDef: IFilterDef): boolean;
    getFilterDef(column: AgColumn, filterDef: IFilterDef): IFilterDef;
    getDefs(column: AgColumn, filterDef: IFilterDef, overrideIndex?: number): {
        filterDefs: SelectableFilterDef[];
        activeFilterDef: SelectableFilterDef;
    } | undefined;
    setActive(colId: string, filterDefs: SelectableFilterDef[], activeFilterDef: SelectableFilterDef, silent?: boolean): void;
    clearActive(colId: string): void;
    getState(): SelectableFilterState | undefined;
    setState(state: SelectableFilterState | undefined): void;
    destroy(): void;
    private clearAll;
    private onChange;
    private getDefaultFilters;
}
