import type { IRowNode, RowNode } from 'ag-grid-community';
/**
 * Sorts `nodes` by `RowNode.level` descending (deepest first).
 * Returns the input array (mutated in-place) or a new sorted array.
 * The sort is stable: nodes at the same level preserve their input order.
 *
 */
export declare const _sortNodesByDepthFirst: (nodes: IRowNode[], nodesLen?: number) => RowNode[];
