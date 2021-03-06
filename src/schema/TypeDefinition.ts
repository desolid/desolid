import { ObjectTypeDefinitionNode, ObjectTypeExtensionNode } from 'graphql';
import {
    FieldOutConfig,
    NexusObjectTypeDef,
    NexusObjectTypeConfig,
    ObjectDefinitionBlock,
} from '@nexus/schema/dist/core';
import { Schema, FieldDefinition, DirectiveDefinition } from '.';
import { MapX } from '../utils';

export type TypeDirectives = 'model' | 'authorization';

export class ObjectTypeConfig implements NexusObjectTypeConfig<string> {
    name: string;
    description: string;

    constructor(private typedef: TypeDefinition) {
        this.name = typedef.name;
        this.description = typedef.description;
    }

    public definition(t: ObjectDefinitionBlock<string>) {
        this.typedef.fields.forEach((field) => {
            if (field.typeName != 'Password') {
                t.field(field.name, { ...field.config, type: field.typeName } as FieldOutConfig<any, any>);
            }
        });
    }
}

export class TypeDefinition extends NexusObjectTypeDef<string> {
    public readonly config = new ObjectTypeConfig(this);
    public readonly fields = new MapX<string, FieldDefinition>();
    public readonly directives = new MapX<TypeDirectives, any>();
    public readonly isModel: boolean;

    constructor(public schema: Schema, private readonly definition: ObjectTypeDefinitionNode) {
        super(definition.name.value, undefined);
        definition.fields.forEach((field) => {
            this.fields.set(field.name.value, new FieldDefinition(field, this));
        });
        definition.directives.forEach((item) => {
            const directive = new DirectiveDefinition(item);
            this.directives.set(directive.name as TypeDirectives, directive.arguments);
        });
        this.isModel = this.directives.has('model');
    }

    public get description() {
        return this.definition.description?.value;
    }

    public get uniqueFields() {
        return this.fields.filter((field) => field.directives.has('unique'));
    }

    public get scalars() {
        return this.fields.filter((field) => field.isScalar);
    }

    public extend(definition: ObjectTypeExtensionNode) {
        definition.fields.forEach((field) => {
            this.fields.set(field.name.value, new FieldDefinition(field, this));
        });
        definition.directives.forEach((item) => {
            const directive = new DirectiveDefinition(item);
            this.directives.set(directive.name as TypeDirectives, directive.arguments);
        });
    }
}
