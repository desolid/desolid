import { ObjectTypeDefinitionNode, StringValueNode, DirectiveNode, FieldDefinitionNode, TypeNode } from 'graphql';
import { FieldOutConfig } from 'nexus/dist/core';
import { Scalar } from '.';
import { scalarTypes } from './scalars';
import { ColumnType } from 'typeorm';

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
    databaseType?: ColumnType;
    isScalar: boolean;
    description: string;
    directives: { [key in FieldDirectives]: any };
    config: FieldOutConfig<any, any>;
}

export class TypeDefinition {
    name: string;
    description: string;
    directives: { [key in ModelDirectives]: any } = {} as any;
    fields: FieldDefinition[];
    constructor(definition: ObjectTypeDefinitionNode) {
        this.name = definition.name.value;
        this.description = definition.description?.value;
        this.fields = definition.fields.map((field) => this.createField(field));
        definition.directives.forEach((item) => {
            const directive = this.createDirective(item);
            this.directives[directive.name] = directive.arguments;
        });
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
            list: list ? list.map((item) => !/^!/.test(item)) : false,
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
