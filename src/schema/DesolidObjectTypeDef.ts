import { ObjectTypeDefinitionNode, StringValueNode, DirectiveNode, FieldDefinitionNode, TypeNode } from 'graphql';
import { FieldOutConfig, NexusObjectTypeDef, NexusObjectTypeConfig, ObjectDefinitionBlock } from 'nexus/dist/core';
import { Scalar, Schema } from '../graphql';
import { scalarTypes } from './scalars';
import { DataType, ModelCtor } from 'sequelize/types';

export type FieldType = Scalar | 'Enum' | 'Object' | 'Relation';
export type ModelDirectives = 'model' | 'authorization';
export type FieldDirectives =
    | 'authorization'
    | 'createdAt'
    | 'updatedAt'
    | 'default'
    | 'upload'
    | 'unique'
    | 'validation'
    | 'relation';

export interface DirectiveDefinition {
    name: string;
    arguments: { [key: string]: any };
}

export interface FieldDefinition {
    name: string;
    type: FieldType;
    databaseType?: DataType;
    isScalar: boolean;
    description: string;
    directives: { [key in FieldDirectives]: any };
    config: FieldOutConfig<any, any>;
}

class DesolidObjectTypeConfig implements NexusObjectTypeConfig<string> {
    name: string;
    description: string;
    constructor(private typedef: DesolidObjectTypeDef) {
        this.name = typedef.name;
        this.description = typedef.description;
    }
    public definition(t: ObjectDefinitionBlock<string>) {
        this.typedef.fields.forEach((field) => {
            const type = this.typedef.schema.dictionary.get(field.type);
            t.field(field.name, {
                ...field.config,
                type: type || field.type,
            } as FieldOutConfig<any, any>);
        });
    }
}

export class DesolidObjectTypeDef extends NexusObjectTypeDef<string> {
    config = new DesolidObjectTypeConfig(this);
    fields: FieldDefinition[] = undefined;
    directives: { [key in ModelDirectives]: any } = {} as any;
    // Will set on the database constructor
    model: ModelCtor<any> = undefined;

    constructor(public schema: Schema, private readonly definition: ObjectTypeDefinitionNode) {
        super(definition.name.value, undefined);
        this.fields = definition.fields.map((field) => this.createField(field));
        definition.directives.forEach((item) => {
            const directive = this.createDirective(item);
            this.directives[directive.name] = directive.arguments;
        });
    }

    public get description() {
        return this.definition.description?.value;
    }

    public get isModel() {
        return this.directives.model ? true : false;
    }

    private createDirective(directive: DirectiveNode): DirectiveDefinition {
        return {
            name: directive.name.value,
            arguments: directive.arguments.reduce((output, argument) => {
                output[argument.name.value] = (argument.value as StringValueNode).value;
                return output;
            }, {}),
        };
    }

    private createField(field: FieldDefinitionNode): FieldDefinition {
        const encodedFieldType = this.encodeFieldType(field);
        const list = encodedFieldType.match(/[\w!]\]/g);
        const config = {
            nullable: !/!$/.test(encodedFieldType),
            list: list ? list.map((item) => /^!/.test(item)) : false,
        } as FieldOutConfig<any, any>;
        const directives: any = {};
        field.directives.forEach((item) => {
            const summary = this.createDirective(item);
            directives[summary.name] = summary.arguments;
        });
        const type = encodedFieldType.replace(/[!\]]/g, '') as FieldType;
        return {
            name: field.name.value,
            description: field.description?.value,
            type,
            isScalar: scalarTypes.indexOf(type as Scalar) >= 0,
            config,
            directives,
        };
    }

    private encodeFieldType(field: FieldDefinitionNode | TypeNode): string {
        switch (field.kind) {
            case 'FieldDefinition':
                return this.encodeFieldType(field.type);
            case 'NamedType':
                return field.name.value;
            case 'ListType':
                return `${this.encodeFieldType(field.type)}]`;
            case 'NonNullType':
                return `${this.encodeFieldType(field.type)}!`;
        }
    }
}
