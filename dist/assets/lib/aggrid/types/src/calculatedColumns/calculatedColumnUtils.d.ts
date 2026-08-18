import type { ColDef, UserColumnPropertyKey } from 'ag-grid-community';
/** The definition properties the Calculated Column dialog lets a user choose. Only these are recorded in
 *  the user-column layer: the rest of a calc col's definition is derived on build (`editable`,
 *  `suppressPaste`, the data-type properties), or owned by another grid state section (width, sort, …). */
export declare const USER_OWNED_PROPERTIES: readonly UserColumnPropertyKey[];
/** Projects a calc col's definition onto the properties a user configured, for persisting in grid state.
 *  `undefined` values are kept: they record a property the user cleared. */
export declare function pickUserOwnedProperties(colDef: ColDef): ColDef;
/**
 * When `cellDataType` changes on a calculated column (e.g. via the Edit dialog moving Boolean →
 * Number), the data-type service does not re-resolve properties it implicitly set for the old
 * type (cellRenderer, valueFormatter, etc.) — they remain on the resolved colDef and leak the
 * previous type's behaviour. This strips those properties from the base before the user's update
 * merges in, but only when the user did not provide them explicitly on the original colDef.
 *
 * @param colDef The current resolved colDef on the AgColumn.
 * @param userColDef The original user-provided colDef (preserves explicit overrides).
 * @param colDefUpdate The incoming patch — only acts when its `cellDataType` differs.
 */
export declare function clearStaleDataTypeProperties(colDef: ColDef, userColDef: ColDef | null, colDefUpdate: ColDef): ColDef;
/**
 * Visits every `[ref]` bracket reference in a calculated-column expression and produces a new
 * expression with each reference replaced by the callback's return value. String-literal
 * boundaries (`"..."`) are respected, including the SQL-style `""` escape — brackets inside a
 * string literal are left untouched.
 *
 * Callers that only need to visit (no rewrite) can return the input `ref` unchanged; the returned
 * string is identical to the input in that case.
 *
 * Must stay in sync with the parser's `isInsideStringLiteral` semantics in
 * `formula/ast/parsers.ts`.
 *
 * @param expression The expression to scan, typically the raw `calculatedExpression` value.
 * @param replaceReference Receives each bracketed reference (without the brackets); the return
 *   value replaces the bracketed token in the output expression.
 * @returns The expression with each reference replaced; returns the input verbatim when no
 *   bracket references are present.
 */
export declare function replaceBracketReferences(expression: string, replaceReference: (reference: string) => string): string;
export declare function getOperatorReplacementRange(expression: string, selectionStart: number, selectionEnd: number, operators: readonly string[]): {
    start: number;
    end: number;
};
export declare function isInsideStringLiteral(expression: string, offset: number): boolean;
