import { ObjectTypeDefinitionNode, StringValueNode, DirectiveNode, FieldDefinitionNode, TypeNode } from 'graphql';
import { FieldOutConfig } from 'nexus/dist/core';

export interface DirectiveSummary {
    name: string;
    value: {
        name: string;
        value: any;
    }[];
}
export interface FieldSummary {
    name: string;
    type: string;
    description: string;
    directives: DirectiveSummary[];
    nexusOptions: FieldOutConfig<any, any>;
}

export interface ObjectTypeDefinitionSummary {
    name: string;
    description: string;
    directives: DirectiveSummary[];
    fields: FieldSummary[];
}

export function summarize(definition: ObjectTypeDefinitionNode): ObjectTypeDefinitionSummary {
    return {
        name: definition.name.value,
        description: definition.description?.value,
        directives: definition.directives.map(summarizeDirective),
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
    const nexusOptions = {
        nullable: !/!$/.test(encodedFieldType),
        list: list ? list.map((item) => /^!/.test(item)) : false,
    } as any;
    return {
        name: field.name.value,
        type: encodedFieldType.replace(/[!\]]/g, ''),
        description: field.description?.value,
        directives: field.directives.map(summarizeDirective),
        nexusOptions,
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
