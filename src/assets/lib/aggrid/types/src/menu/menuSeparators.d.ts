export declare const MENU_ITEM_SEPARATOR = "separator";
/**
 * Collapse repeated separators and drop any stranded at the start or end of the list. Mutates in place.
 */
export declare function _normaliseSeparators<T>(array: T[], separator: T): void;
