import type { AgColumn, AgProvidedColumnGroup, ColumnMenuItemsSource, DefaultColumnMenuItem, GridOptionsService, MenuItemDef } from 'ag-grid-community';
type ColumnMenuDefaultItems = DefaultColumnMenuItem[];
type ColumnMenuItems = (DefaultColumnMenuItem | MenuItemDef)[];
/**
 * Resolves the final menu item list for a column-scoped menu on any surface (column menu,
 * Columns Tool Panel, Column Chooser), applying user customisation with this precedence:
 * `columnMenuItems` (col/group) -> `getColumnMenuItems` (grid) -> [`source: 'columnMenu'` only]
 * legacy `mainMenuItems` (col/group) -> `getMainMenuItems` (grid) -> `defaultItems`.
 */
export declare function _resolveColumnMenuItems(gos: GridOptionsService, column: AgColumn | null, columnGroup: AgProvidedColumnGroup | null, source: ColumnMenuItemsSource, defaultItems: ColumnMenuDefaultItems): ColumnMenuItems;
export {};
