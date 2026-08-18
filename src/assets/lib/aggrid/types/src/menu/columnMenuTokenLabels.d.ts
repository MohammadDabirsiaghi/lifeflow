import type { LocaleTextFunc } from 'ag-stack';
import type { IconName } from 'ag-grid-community';
interface ToggleTokenLabels {
    addKey: string;
    addDefault: (displayName: string) => string;
    removeKey: string;
    removeDefault: (displayName: string) => string;
    icon: IconName;
}
interface ActionTokenLabels {
    key: string;
    default: (displayName: string) => string;
    icon: IconName;
}
export declare const VALUE_TOKEN: ToggleTokenLabels;
export declare const PIVOT_TOKEN: ToggleTokenLabels;
export declare const SCROLL_INTO_VIEW_TOKEN: ActionTokenLabels;
export declare function columnMenuTokenLabel(localeTextFunc: LocaleTextFunc, key: string, defaultText: (displayName: string) => string, displayName: string): string;
export {};
