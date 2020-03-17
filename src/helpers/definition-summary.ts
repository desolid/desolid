import { ObjectTypeDefinitionNode, StringValueNode, DirectiveNode, FieldDefinitionNode, TypeNode } from 'graphql';
import { FieldOutConfig } from 'nexus/dist/core';

type ModelDirectives = 'model' | 'authorization';
type FieldDirectives = 'authorization' | 'createdAt' | 'updatedAt' | 'default' | 'upload' | 'unique' | 'validation';

export interface DirectiveSummary {
    name: string;
    value: { [key: string]: any };
}
export interface FieldSummary {
    name: string;
    type: string;
    description: string;
    directives: { [key in FieldDirectives]: any };
    config: FieldOutConfig<any, any>;
}

export interface ObjectTypeDefinitionSummary {
    name: string;
    description: string;
    directives: { [key in ModelDirectives]: any };
    fields: FieldSummary[];
}

export function summarize(definition: ObjectTypeDefinitionNode): ObjectTypeDefinitionSummary {
    const directives: any = {};
    definition.directives.map(summarizeDirective).forEach((item) => {
        directives[item.name] = item.value;
    });
    return {
        name: definition.name.value,
        description: definition.description?.value,
        directives,
        fields: definition.fields.map(summarizeField),
    };
}

function summarizeDirective(directive: DirectiveNode): DirectiveSummary {
    return {
        name: directive.name.value,
        value: directive.arguments.map((argument) => {
            return {
                name: argument.name.value,
                value: (argument.value as StringValueNode).value,
            };
        }),
    };
}

function summarizeField(field: FieldDefinitionNode): FieldSummary {
    const encodedFieldType = encodeFieldType(field);
    const list = encodedFieldType.match(/[\w!]\]/g);
    const config = {
        nullable: !/!$/.test(encodedFieldType),
        list: list ? list.map((item) => /^!/.test(item)) : false,
    } as FieldOutConfig<any, any>;
    const directives: any = {};
    field.directives.map(summarizeDirective).forEach((item) => {
        directives[item.name] = item.value;
    });
    return {
        name: field.name.value,
        type: encodedFieldType.replace(/[!\]]/g, ''),
        description: field.description?.value,
        directives,
        config,
    };
}

function encodeFieldType(field: FieldDefinitionNode | TypeNode): string {
    switch (field.kind) {
        case 'FieldDefinition':
            return encodeFieldType(field.type);
        case 'NamedType':
            return field.name.value;
        case 'ListType':
            return `${encodeFieldType(field.type)}]`;
        case 'NonNullType':
            return `${encodeFieldType(field.type)}!`;
    }
}
