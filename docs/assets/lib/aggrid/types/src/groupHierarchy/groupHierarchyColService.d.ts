import type { ColumnTreeBuild, IGroupHierarchyColService, NamedBean } from 'ag-grid-community';
import { AgColumn, BeanStub } from 'ag-grid-community';
export declare class GroupHierarchyColService extends BeanStub implements NamedBean, IGroupHierarchyColService {
    beanName: "groupHierarchyColSvc";
    /** Generated hierarchy cols (year, quarter, month, …). `contributeTo` prepends these into the builder's
     *  tree; the builder owns their padding wrappers via ColumnModel's wrapper cache. */
    columns: AgColumn[];
    /** Source col → its generated virtuals. */
    private readonly sourceColumnMap;
    /** Virtual col → `{ source, index }` — the inverse of `sourceColumnMap`. */
    private readonly virtualColInfo;
    /** Plan the expected colIds: rebuild the cols when they differ, else refresh their defs in place so a
     *  config / inline-part change is picked up without churning beans on a no-op refresh. */
    contributeTo(build: ColumnTreeBuild): void;
    /** Same colIds: refresh each def in place. Reusing the live getters keeps an unchanged part a `setColDef`
     *  no-op, so only a real change (config / inline part / `defaultColDef`) re-applies. */
    private reapplyDefs;
    /** Allocate fresh hierarchy AgColumns from a plan whose colIds differ from current. */
    private rebuildColumns;
    /** Project the hierarchy cols expected for `colDefList`; `matches` is true when their colIds equal the
     *  current `columns` (same count, same order), so the cols can be reused rather than rebuilt. */
    private planHierarchy;
    destroy(): void;
    private clearColumns;
    compareVirtualColumns(colA: AgColumn, colB: AgColumn): number | null;
    /** This source col's generated virtuals, in order (seated immediately before it); undefined if none. */
    getVirtualCols(sourceCol: AgColumn): AgColumn[] | undefined;
    /** Build the ColDef for one part. Inline parts merge directly; configured parts overlay the config; a
     *  canonical date part takes its header/value getters from {@link DATE_PART_SPECS}. `reuse` (a same-col
     *  refresh) supplies the prior getters, so they aren't re-minted as fresh closures every refresh. */
    private createColDefForPart;
}
