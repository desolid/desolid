import { FieldDefinitionNode, TypeNode } from 'graphql';
import { FieldOutConfig } from '@nexus/schema/dist/core';
import * as _ from 'lodash';
import { Scalar, DirectiveDefinition, scalarTypes, stringScalars, TypeDefinition } from '.';
import { MapX } from '../utils';

export interface UploadDirectiveArguments {
    accept: string[];
    size: { max: number; min: number };
}

export type FieldDirectiveArguments = UploadDirectiveArguments | void;

export type FieldType = Scalar;

export type FieldDirectives = 'authorization' | 'default' | 'upload' | 'unique' | 'validation';

export type RelationType = 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';

export class FieldDefinition {
    public readonly typeName: string;
    public readonly name: string;
    public readonly isScalar: boolean;
    public readonly isString: boolean;
    public readonly description: string;
    public readonly directives = new MapX<FieldDirectives, FieldDirectiveArguments>();
    public readonly config: FieldOutConfig<any, any>;

    /**
     *
     * @param definition
     * @param owner
     * @todo separate the logic to atomic methods
     */
    constructor(definition: FieldDefinitionNode, public readonly owner: TypeDefinition) {
        const encodedFieldType = this.encodeFieldType(definition);
        this.typeName = encodedFieldType.replace(/[!\]]/g, '') as FieldType;
        const list = encodedFieldType.match(/[\w!]\]/g);
        this.name = definition.name.value;
        this.description = definition.description?.value;
        this.isScalar = scalarTypes.indexOf(this.typeName as Scalar) >= 0;
        this.isString = stringScalars.indexOf(this.typeName as string) >= 0;
        definition.directives.forEach((item) => {
            const summary = new DirectiveDefinition(item);
            this.directives.set(summary.name as FieldDirectives, summary.arguments);
        });
        this.config = {
            nullable: !/!$/.test(encodedFieldType),
            list: list ? list.map((item) => /^!/.test(item)) : false,
        } as FieldOutConfig<any, any>;
        if(this.typeName == 'File' && this.config.list) {
            throw new Error(`To many relations with "File" (on "${owner.name}" model) doesn't support yet.`)
        }
    }

    public get type() {
        if (this.isScalar) {
            return this.typeName;
        } else {
            const type = this.owner.schema.dictionary.get(this.typeName);
            if (type) {
                return type;
            } else {
                throw new Error(`Getting Type "${this.typeName}" before initial deffinitions gathering.`);
            }
        }
    }

    public get relationType() {
        const right = this.type as TypeDefinition;
        if (this.isScalar || !right.isModel) return undefined;
        const meOnTheRight = right.fields.find({ type: this.owner });
        let relationType: RelationType;
        if (meOnTheRight) {
            if (this.config.list) {
                relationType = meOnTheRight.config.list ? 'many-to-many' : 'many-to-one';
            } else {
                relationType = meOnTheRight.config.list ? 'one-to-many' : 'one-to-one';
            }
        } else {
            relationType = this.config.list ? 'many-to-many' : 'many-to-one';
        }
        return relationType;
    }

    public get isToOneRelation() {
        return /-to-one$/.test(this.relationType);
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
