import type { LogService, UpdateChartParams } from 'ag-grid-community';
import type { CommonCreateChartParams } from '../../chartService';
export declare function validateUpdateParams(params: UpdateChartParams, isEnterprise: boolean, log: LogService): boolean | UpdateChartParams;
export declare function validateCreateParams(params: CommonCreateChartParams, isEnterprise: boolean, log: LogService): boolean | CommonCreateChartParams;
