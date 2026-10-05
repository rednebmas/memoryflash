export type JsonSchema = {
	[key: string]: string | boolean | string[] | readonly string[] | JsonSchema;
};

export const strings: JsonSchema = { type: 'array', items: { type: 'string' } };

export const enumOf = (values: readonly string[]): JsonSchema => ({ type: 'string', enum: values });

export const arrayOf = (items: JsonSchema): JsonSchema => ({ type: 'array', items });

export const object = (properties: Record<string, JsonSchema>): JsonSchema => ({
	type: 'object',
	properties,
	required: Object.keys(properties),
	additionalProperties: false,
});
