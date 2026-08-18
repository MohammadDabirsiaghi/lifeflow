export declare const buildColumnVisibilityFeatureSchema: () => {
    readonly type: "object";
    readonly properties: Record<string, import("../schemaBuilder").SchemaBuilder>;
    toJSON(): import("../schemaTypes").ObjectSchema;
    description?: string;
    _defs: Record<string, import("../schemaTypes").JSONSchema>;
    _nullable: boolean;
    _collectNestedDefs(schemas: import("../schemaTypes").JSONSchema[]): Record<string, import("../schemaTypes").JSONSchema>;
    _toJSON(additionalProperties?: Record<string, any>): any;
    nullable(): /*elided*/ any;
    define(id: string, schema: import("../schemaTypes").JSONSchema): /*elided*/ any;
};
