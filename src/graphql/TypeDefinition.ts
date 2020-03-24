import { ObjectTypeDefinitionNode, StringValueNode, DirectiveNode, FieldDefinitionNode, TypeNode } from 'graphql';
import { FieldOutConfig } from 'nexus/dist/core';

type ModelDirectives = 'model' | 'authorization';
type FieldDirectives =
    | 'authorization'
    | 'createdAt'
    | 'updatedAt'
    | 'default'
    | 'upload'
    | 'unique'
    | 'validation'
    | 'relation';

export interface DirectiveSummary {
    name: string;
    arguments: { [key: string]: any };
}
export interface FieldSummary {
    name: string;
    type: string;
    description: string;
    directives: { [key in FieldDirectives]: any };
    config: FieldOutConfig<any, any>;
}

export class TypeDefinition {
    name: string;
    description: string;
    directives: { [key in ModelDirectives]: any } = {} as any;
    fields: FieldSummary[];
    constructor(definition: ObjectTypeDefinitionNode) {
        this.name = definition.name.value;
        this.description = definition.description?.value;
        this.fields = definition.fields.map((field) => this.summarizeField(field));
        definition.directives.forEach((item) => {
            const summary = this.summarizeDirective(item);
            this.directives[summary.name] = summary.arguments;
        });
    }

    private summarizeDirective(directive: DirectiveNode): DirectiveSummary {
        return {
            name: directive.name.value,
            arguments: directive.arguments.reduce((output, argument) => {
                output[argument.name.value] = (argument.value as StringValueNode).value;
                return output;
            }, {}),
        };
    }

    private summarizeField(field: FieldDefinitionNode): FieldSummary {
        const encodedFieldType = this.encodeFieldType(field);
        const list = encodedFieldType.match(/[\w!]\]/g);
        const config = {
            nullable: !/!$/.test(encodedFieldType),
            list: list ? list.map((item) => /^!/.test(item)) : false,
        } as FieldOutConfig<any, any>;
        const directives: any = {};
        field.directives.forEach((item) => {
            const summary = this.summarizeDirective(item);
            directives[summary.name] = summary.arguments;
        });
        return {
            name: field.name.value,
            type: encodedFieldType.replace(/[!\]]/g, ''),
            description: field.description?.value,
            directives,
            config,
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
