package globals

type FunctionTools []ToolObject
type ToolObject struct {
	Type     string       `json:"type"`
	Function ToolFunction `json:"function"`
}

type ToolFunction struct {
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Url         *string        `json:"url,omitempty"`
	Parameters  ToolParameters `json:"parameters"`
}

type ToolParameters struct {
	Type       string         `json:"type"`
	Properties ToolProperties `json:"properties"`
	Required   *[]string      `json:"required,omitempty"`
}

type ToolProperties map[string]ToolProperty

// https://github.com/openai/openai-node/blob/6175eca426b15990be5e5cdb0e8497e547f87d8a/src/lib/jsonschema.ts

type JsonSchemaType any
type JSONSchemaDefinition any
type ToolProperty map[string]interface{}
type DetailToolProperty struct {
	Type  *string           `json:"type,omitempty"`
	Enum  *[]JsonSchemaType `json:"enum,omitempty"`
	Const *JsonSchemaType   `json:"const,omitempty"`

	MultipleOf       *int    `json:"multipleOf,omitempty"`
	Maximum          *int    `json:"maximum,omitempty"`
	ExclusiveMaximum *int    `json:"exclusiveMaximum,omitempty"`
	Minimum          *int    `json:"minimum,omitempty"`
	ExclusiveMinimum *int    `json:"exclusiveMinimum,omitempty"`
	MaxLength        *int    `json:"maxLength,omitempty"`
	MinLength        *int    `json:"minLength,omitempty"`
	Pattern          *string `json:"pattern,omitempty"`

	Items           *JSONSchemaDefinition `json:"items,omitempty"`
	AdditionalItems *JSONSchemaDefinition `json:"additionalItems,omitempty"`
	MaxItems        *int                  `json:"maxItems,omitempty"`
	MinItems        *int                  `json:"minItems,omitempty"`
	UniqueItems     *bool                 `json:"uniqueItems,omitempty"`
	Contains        *JSONSchemaDefinition `json:"contains,omitempty"`

	MaxProperties        *int                     `json:"maxProperties,omitempty"`
	MinProperties        *int                     `json:"minProperties,omitempty"`
	Required             *[]string                `json:"required,omitempty"`
	Properties           *map[string]ToolProperty `json:"properties,omitempty"`
	PatternProperties    *map[string]ToolProperty `json:"patternProperties,omitempty"`
	AdditionalProperties *JSONSchemaDefinition    `json:"additionalProperties,omitempty"`
	PropertyNames        *JSONSchemaDefinition    `json:"propertyNames,omitempty"`

	If   *JSONSchemaDefinition `json:"if,omitempty"`
	Then *JSONSchemaDefinition `json:"then,omitempty"`
	Else *JSONSchemaDefinition `json:"else,omitempty"`

	AllOf *[]JSONSchemaDefinition `json:"allOf,omitempty"`
	AnyOf *[]JSONSchemaDefinition `json:"anyOf,omitempty"`
	OneOf *[]JSONSchemaDefinition `json:"oneOf,omitempty"`
	Not   *JSONSchemaDefinition   `json:"not,omitempty"`

	Format *string `json:"format,omitempty"`

	Title       *string         `json:"title,omitempty"`
	Description *string         `json:"description,omitempty"`
	Default     *string         `json:"default,omitempty"`
	ReadOnly    *bool           `json:"readOnly,omitempty"`
	WriteOnly   *bool           `json:"writeOnly,omitempty"`
	Examples    *JsonSchemaType `json:"examples,omitempty"`
}

type ToolCallFunction struct {
	Name      string `json:"name,omitempty"`
	Arguments string `json:"arguments,omitempty"`
}

type ToolCall struct {
	Index    *int             `json:"index,omitempty"`
	Type     string           `json:"type"`
	Id       string           `json:"id"`
	Function ToolCallFunction `json:"function"`
}
type ToolCalls []ToolCall

type FunctionCall struct {
	Name      string `json:"name"`
	Arguments string `json:"arguments"`
}
