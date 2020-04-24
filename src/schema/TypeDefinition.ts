import { ObjectTypeDefinitionNode } from 'graphql';
import {
    FieldOutConfig,
    NexusObjectTypeDef,
    NexusObjectTypeConfig,
    ObjectDefinitionBlock,
} from '@nexus/schema/dist/core';
import { Schema, FieldDefinition, DirectiveDefinition } from '.';
import { Model } from '../database';

export type TypeDirectives = 'model' | 'authorization';

class ObjectTypeConfig implements NexusObjectTypeConfig<string> {
    name: string;
    description: string;

    constructor(private typedef: TypeDefinition) {
        this.name = typedef.name;
        this.description = typedef.description;
    }

    public definition(t: ObjectDefinitionBlock<string>) {
        this.typedef.fields.forEach((field) =>
            t.field(field.name, { ...field.config, type: field.type } as FieldOutConfig<any, any>),
        );
    }
}

export class TypeDefinition extends NexusObjectTypeDef<string> {
    config = new ObjectTypeConfig(this);
    fields: FieldDefinition[] = undefined;
    directives: { [key in TypeDirectives]: any } = {} as any;
    // Will set on the database constructor
    model: Model = undefined;
    
    constructor(public schema: Schema, private readonly definition: ObjectTypeDefinitionNode) {
        super(definition.name.value, undefined);
        this.fields = definition.fields.map((field) => new FieldDefinition(field, this));
        definition.directives.forEach((item) => {
            const directive = new DirectiveDefinition(item);
            this.directives[directive.name] = directive.arguments;
        });
    }

    public get description() {
        return this.definition.description?.value;
    }

    public get isModel() {
        return this.directives.model ? true : false;
    }

    public get relations() {
        return this.fields.filter((field) => field.relation);
    }
}
