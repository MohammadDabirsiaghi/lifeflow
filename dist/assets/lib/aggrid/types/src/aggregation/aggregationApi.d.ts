import type { BeanCollection, ColAggFunc, ColKey, IAggFunc } from 'ag-grid-community';
export declare function addAggFuncs(beans: BeanCollection, aggFuncs: {
    [key: string]: IAggFunc;
}): void;
export declare function clearAggFuncs(beans: BeanCollection): void;
export declare function setColumnAggFunc(beans: BeanCollection, key: ColKey, aggFunc: ColAggFunc): void;
