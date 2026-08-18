import type { AgColumn, ColumnTreeBuild } from 'ag-grid-community';
/** Append `col` after `afterColId` (inheriting its group) if present, else at top-level end. O(1), lazily
 *  opens the session. NB: several cols sharing ONE anchor must be appended in reverse of desired order. */
export declare const appendColumnToTree: (build: ColumnTreeBuild, col: AgColumn, afterColId?: string) => void;
/** Prepend service/hierarchy `cols`, each wrapped to current depth so a bare leaf renders at leaf level.
 *  Back-to-front so the list ends in `cols` order; lazily opens the session, no-op when empty. */
export declare const prependWrappedColumnsToTree: (build: ColumnTreeBuild, cols: AgColumn[]) => void;
