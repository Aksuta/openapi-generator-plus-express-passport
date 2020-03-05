import { OpenAPI } from 'openapi-types'
import SwaggerParser = require('swagger-parser')

export interface CodegenState {
	parser: SwaggerParser
	root: OpenAPI.Document
	config: CodegenGenerator
	options: CodegenOptions
	anonymousModels: { [name: string]: CodegenModel }
}

/**
 * The interface implemented by language-specific generator modules.
 */
export interface CodegenGenerator {
	toClassName: (name: string, state: CodegenState) => string
	toIdentifier: (name: string, state: CodegenState) => string
	toConstantName: (name: string, state: CodegenState) => string
	toEnumName: (name: string, state: CodegenState) => string
	toOperationName: (path: string, method: string, state: CodegenState) => string
	/** Convert a property name to a name suitable for a model class */
	toModelNameFromPropertyName: (name: string, state: CodegenState) => string

	/** Format a value as a literal in the language */
	toLiteral: (value: any, type: string, format: string | undefined, required: boolean, state: CodegenState) => string
	toNativeType: (options: CodegenTypeOptions, state: CodegenState) => CodegenNativeType
	toNativeArrayType: (options: CodegenArrayTypeOptions, state: CodegenState) => CodegenNativeType
	toNativeMapType: (options: CodegenMapTypeOptions, state: CodegenState) => CodegenNativeType
	/** Return the default value to use for a property as a literal in the language */
	toDefaultValue: (defaultValue: any, type: string, format: string | undefined, required: boolean, state: CodegenState) => string

	options: (config: CodegenConfig) => CodegenOptions
	operationGroupingStrategy: (state: CodegenState) => CodegenOperationGroupingStrategy

	exportTemplates: (doc: CodegenDocument, state: CodegenState) => void
}

/**
 * The options from a config file.
 */
export interface CodegenConfig {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[name: string]: any
}

/**
 * Options that the user can provide to the code generation process.
 */
export interface CodegenOptions {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[name: string]: any
	hideGenerationTimestamp?: boolean
}

/**
 * Code generation specific context attributes that are added to the root context.
 */
export interface CodegenRootContext {
	generatorClass: string
	generatedDate: string
}

export interface CodegenDocument {
	info: CodegenInfo
	groups: CodegenOperationGroup[]
	models: CodegenModel[]
	servers?: CodegenServer[]
}

export interface CodegenInfo {
	title: string
	description?: string
	termsOfService?: string
	contact?: CodegenContactObject
	license?: CodegenLicenseObject
	version: string
}

export interface CodegenContactObject {
	name?: string
	url?: string
	email?: string
}
export interface CodegenLicenseObject {
	name: string
	url?: string
}

export interface CodegenServer {
	url: string
	description?: string
}

export interface CodegenOperationGroups {
	[name: string]: CodegenOperationGroup
}

export interface CodegenOperationGroup {
	name: string
	path: string
	
	operations: CodegenOperation[]
	consumes?: CodegenMediaType[] // TODO in OpenAPIV2 these are on the document, but not on OpenAPIV3
	produces?: CodegenMediaType[] // TODO in OpenAPIV2 these are on the document, but not on OpenAPIV3
}

export interface CodegenOperation {
	name: string
	httpMethod: string
	path: string
	returnType?: string
	returnNativeType?: CodegenNativeType
	consumes?: CodegenMediaType[] // TODO in OpenAPIV2 these are on the document, but not on OpenAPIV3
	produces?: CodegenMediaType[] // TODO in OpenAPIV2 these are on the document, but not on OpenAPIV3

	allParams?: CodegenParameter[]
	queryParams?: CodegenParameter[]
	pathParams?: CodegenParameter[]
	headerParams?: CodegenParameter[]
	cookieParams?: CodegenParameter[]
	bodyParam?: CodegenParameter
	formParams?: CodegenParameter[]

	authMethods?: CodegenAuthMethod[]
	vendorExtensions?: CodegenVendorExtensions
	responses?: CodegenResponse[]
	defaultResponse?: CodegenResponse
	isDeprecated?: boolean
	summary?: string
	description?: string
	tags?: string[]
}

export interface CodegenResponse {
	code: number
	description: string // TODO called message in swagger-codegen
	// schema?: CodegenProperty
	type?: string
	containerType?: string // TODO what is this?
	isDefault: boolean
	vendorExtensions?: CodegenVendorExtensions
	nativeType?: CodegenNativeType
}

export class CodegenNativeType {
	/** The type in the native language */
	public nativeType: string
	/**
	 * The type, in the native language, if the property hasn't gone through extra conversion after coming out of, 
	 * or won't go through extra conversion before going into the communication layer.
	 */
	public wireType?: string
	/**
	 * The type, in the native language, when expressing this type as a type literal, e.g. in java `java.util.List.class`
	 * as opposed to `java.util.List<java.lang.String>.class`, which is not valid as a type literal.
	 */
	public literalType?: string

	public constructor(nativeType: string, wireType?: string | null, literalType?: string | null) {
		this.nativeType = nativeType
		this.wireType = wireType !== undefined ? wireType !== null ? wireType : undefined : nativeType
		this.literalType = literalType !== undefined ? literalType !== null ? literalType : undefined : nativeType
	}

	public toString() {
		return this.nativeType
	}
}

interface CodegenTypes {
	isObject: boolean
	isArray: boolean
	isBoolean: boolean
	isNumber: boolean
	isEnum: boolean
	isDateTime: boolean
	isDate: boolean
	isTime: boolean
}

/* See DefaultCodegen.fromProperty */
export interface CodegenProperty extends CodegenTypes {
	name: string
	description?: string
	title?: string
	exampleValue?: string
	defaultValue?: string
	readOnly: boolean
	required: boolean
	vendorExtensions?: CodegenVendorExtensions

	/** OpenAPI type */
	type: string

	/** Type in native language */
	nativeType: CodegenNativeType

	/* Validation */
	maximum?: number
	exclusiveMaximum?: boolean
	minimum?: number
	exclusiveMinimum?: boolean
	maxLength?: number
	minLength?: number
	pattern?: string
	maxItems?: number
	minItems?: number
	uniqueItems?: boolean
	multipleOf?: number

	/** Nested models */
	models?: CodegenModel[]
}

/** The context for model output */
export interface CodegenModelContext {
	model: CodegenModel[]
}

export interface CodegenModel {
	name: string
	description?: string
	vars: CodegenProperty[]
	vendorExtensions?: CodegenVendorExtensions

	/** Enums */
	isEnum: boolean
	/** The native type of the enum value */
	enumValueNativeType?: CodegenNativeType
	/** The values making up the enum */
	enumValues?: CodegenEnumValue[]

	/** Parent model */
	parent?: CodegenNativeType

	/** Nested models */
	models?: CodegenModel[]
}

export enum CodegenTypePurpose {
	/** A type for an object property */
	PROPERTY = 'PROPERTY',
	/** A type for an enum */
	ENUM = 'ENUM',
	/** A type for a model parent */
	PARENT = 'PARENT',
	/** A type for a Map key */
	KEY = 'KEY',
}

export interface CodegenTypeOptions {
	type: string
	format?: string
	required?: boolean
	modelNames?: string[]
	purpose: CodegenTypePurpose
}

export enum CodegenArrayTypePurpose {
	/** A type for an object property */
	PROPERTY = 'PROPERTY',
	/** A type for a model parent */
	PARENT = 'PARENT',
}

export interface CodegenArrayTypeOptions {
	componentNativeType: CodegenNativeType
	required?: boolean
	/** The uniqueItems property from the API spec */
	uniqueItems?: boolean
	modelNames?: string[]
	purpose: CodegenArrayTypePurpose
}

export enum CodegenMapTypePurpose {
	/** A type for an object property */
	PROPERTY = 'PROPERTY',
	/** A type for a model parent */
	PARENT = 'PARENT',
}

export interface CodegenMapTypeOptions {
	keyNativeType: CodegenNativeType
	componentNativeType: CodegenNativeType
	modelNames?: string[]
	purpose: CodegenMapTypePurpose
}

export interface CodegenEnumValue {
	value: any
	literalValue: string
}

export interface CodegenParameter extends CodegenTypes {
	name: string
	in: string
	type?: string
	nativeType?: CodegenNativeType
	description?: string
	required?: boolean
	collectionFormat?: string

	isQueryParam?: boolean
	isPathParam?: boolean
	isHeaderParam?: boolean
	isCookieParam?: boolean
	isBodyParam?: boolean
	isFormParam?: boolean
}

export interface CodegenVendorExtensions {
	[name: string]: any
}

export interface CodegenAuthMethod {
	type: string
	description?: string
	name: string

	/** The header or query parameter name for apiKey */
	paramName?: string
	in?: string
	
	flow?: string
	authorizationUrl?: string
	tokenUrl?: string
	scopes?: CodegenAuthScope[]

	isBasic?: boolean
	isApiKey?: boolean
	isOAuth?: boolean

	isInQuery?: boolean
	isInHeader?: boolean

	vendorExtensions?: CodegenVendorExtensions
}

export interface CodegenAuthScope {
	scope: string
	description?: string
	
	vendorExtensions?: CodegenVendorExtensions
}

export interface CodegenMediaType {
	mediaType: string

	// TODO OpenAPIV3
}

export type CodegenOperationGroupingStrategy = (operation: CodegenOperation, groups: CodegenOperationGroups, state: CodegenState) => void

/**
 * Error thrown when a model cannot be generated because it doesn't represent a valid model in
 * the current generator.
 */
export class InvalidModelError extends Error {
	public constructor(message?: string) {
		super(message)
	}
}
