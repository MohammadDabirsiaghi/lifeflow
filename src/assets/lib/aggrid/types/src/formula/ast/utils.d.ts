import type { FormulaErrorId, FormulaErrorType } from '../i18n';
interface FormulaOperand {
    type: 'operand';
    value: string | number | boolean | Cell | null;
}
export interface FormulaOperation {
    type: 'operation';
    operation: string;
    operands: FormulaNode[];
}
export type FormulaNode = FormulaOperand | FormulaOperation;
export declare class FormulaError extends Error {
    name: string;
    readonly type: FormulaErrorType;
    readonly errorId: FormulaErrorId | null;
    readonly localeKey: string | null;
    readonly defaultMessage: string;
    readonly variableValues: string[] | undefined;
    constructor(message: string, type?: FormulaErrorType);
    constructor(errorId: FormulaErrorId, variableValues?: readonly unknown[], type?: FormulaErrorType);
    getTranslatedMessage(translate: (key: string, defaultValue: string, variableValues?: string[]) => string): string;
}
export declare class FormulaParseError extends FormulaError {
    readonly errorStart: number;
    readonly errorEnd: number;
    constructor(errorId: FormulaErrorId, errorStart: number, errorEnd: number, variableValues?: readonly unknown[]);
}
export type CellRef = {
    id: string;
    absolute: boolean;
    current?: boolean;
};
export type Cell = {
    column: CellRef;
    row: CellRef;
    endColumn?: CellRef;
    endRow?: CellRef;
};
/**
 * Walk an AST depth-first and return the first operation name for which `isValid` returns false.
 * Used by pre-evaluation validators that want to catch unsupported function names without running
 * the formula. Returns null when every operation is valid.
 */
export declare function findFirstInvalidOperation(node: FormulaNode, isValid: (name: string) => boolean): string | null;
export {};
