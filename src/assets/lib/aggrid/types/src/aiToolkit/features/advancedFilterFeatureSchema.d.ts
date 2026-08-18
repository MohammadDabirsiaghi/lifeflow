import type { BeanCollection } from 'ag-grid-community';
import type { JSONSchema } from '../schemaTypes';
export declare const buildAdvancedFilterFeatureSchema: ({ colModel, dataTypeSvc }: BeanCollection) => {
    readonly type: "object";
    readonly properties: Record<string, import("../schemaBuilder").SchemaBuilder>;
    toJSON(): import("../schemaTypes").ObjectSchema;
    description?: string;
    _defs: Record<string, JSONSchema>;
    _nullable: boolean;
    _collectNestedDefs(schemas: JSONSchema[]): Record<string, JSONSchema>;
    _toJSON(additionalProperties?: Record<string, any>): any;
    nullable(): /*elided*/ any;
    define(id: string, schema: JSONSchema): /*elided*/ any;
} | undefined;
