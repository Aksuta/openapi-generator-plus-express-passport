import { OpenAPI, OpenAPIV2, OpenAPIV3 } from 'openapi-types'
import SwaggerParser = require('swagger-parser')

export interface CodegenConfig {
	toClassName: (name: string) => string
	toIdentifier: (name: string) => string
	toNativeType: (type: string, format: string | undefined, required: boolean, refName: string | undefined) => string
}

/**
 * Options that the user can provide to the code generation process.
 */
export interface CodegenOptions {
	hideGenerationTimestamp?: boolean
}

/**
 * Options specific to Java that the user can provide to the code generation process.
 */
export interface CodegenOptionsJava extends CodegenOptions {
	useBeanValidation?: boolean
	package: string
	imports?: string[]
}

/**
 * Code generation specific context attributes that are added to the root context.
 */
export interface CodegenRootContext {
	generatorClass: string
	generatedDate: string
}

export interface CodegenDocument {
	groups: { [name: string]: CodegenOperationGroup | undefined }
}

export interface CodegenOperationGroup {
	name: string
	path: string
	
	operations: CodegenOperations
	consumes?: CodegenMediaType[] // TODO in OpenAPIV2 these are on the document, but not on OpenAPIV3
	produces?: CodegenMediaType[] // TODO in OpenAPIV2 these are on the document, but not on OpenAPIV3
}

export interface CodegenOperations {
	operation: CodegenOperation[]
}

export interface CodegenOperation {
	operationId?: string
	httpMethod: string
	path: string
	returnType?: string
	returnNativeType?: string
	consumes?: CodegenMediaType[] // TODO in OpenAPIV2 these are on the document, but not on OpenAPIV3
	produces?: CodegenMediaType[] // TODO in OpenAPIV2 these are on the document, but not on OpenAPIV3
	allParams?: CodegenParameter[]
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
	nativeType?: string
}

/* See DefaultCodegen.fromProperty */
export interface CodegenProperty {
	name: string
	description?: string
	title?: string
	exampleValue?: string
	defaultValue?: any
	readOnly?: boolean
	vendorExtensions?: CodegenVendorExtensions
	// TODO validation

	/** OpenAPI type */
	type?: string

	/** Type in native language */
	nativeType?: string
}

export interface CodegenParameter {
	name: string
	in: string
	type?: string
	nativeType?: string
	description?: string
	required?: boolean
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

export interface CodegenState {
	parser: SwaggerParser
	root: OpenAPI.Document
	config: CodegenConfig
}

export interface CodegenAuthMethod {
	name: string
	isOAuth?: boolean
	scopes?: string[]
	description?: string
}

export interface CodegenMediaType {
	mediaType: string

	// TODO OpenAPIV3
}
