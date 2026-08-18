import type { BeanCollection, ShowValuesAsBuiltInType, ShowValuesAsModeDef } from 'ag-grid-community';
/** Default formatter precision (decimal places) when neither the selection nor the config sets one. */
export declare const DEFAULT_PRECISION = 2;
/**
 * The built-in "Show Values As" modes as a base {@link ShowValuesAsModeDef}, deep-merged under the user's
 * `colDef.showValuesAsDef` (itself merged from `defaultColDef`); a user entry of the same name overrides
 * field-by-field. Each mode is a plain {@link ShowValuesAsModeDef} — no separate built-in type.
 */
export declare const makeBuiltinShowValuesAsModesDef: (beans: BeanCollection) => Record<ShowValuesAsBuiltInType, ShowValuesAsModeDef>;
