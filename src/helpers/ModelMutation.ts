import { ObjectDefinitionBlock } from 'nexus/dist/core';
import { GraphQLResolveInfo } from 'graphql';
import * as pluralize from 'pluralize';
import { Model } from 'src/entities/Model';
import { Type } from '../entities/Type';

export class ModelMutation {
    constructor(protected model: Model, protected t: ObjectDefinitionBlock<string>) {
        t.field(`create${this.model.name}`, {
            type: Type.dictionary.get(this.model.name),
            resolve: this.createOne.bind(this),
        });
        t.field(`update${this.model.name}`, {
            type: Type.dictionary.get(this.model.name),
            nullable: true,
            resolve: this.updateOne.bind(this),
        });
        t.list.field(`updateMany${pluralize(this.model.name)}`, {
            type: Type.dictionary.get(this.model.name),
            nullable: true,
            resolve: this.updateMany.bind(this),
        });
        t.field(`delete${this.model.name}`, {
            type: Type.dictionary.get(this.model.name),
            nullable: true,
            resolve: this.deleteOne.bind(this),
        });
        t.list.field(`deleteMany${pluralize(this.model.name)}`, {
            type: Type.dictionary.get(this.model.name),
            nullable: true,
            resolve: this.deleteMany.bind(this),
        });
    }
    private createOne(root: any, args: any, context: any, info: GraphQLResolveInfo): any {
        debugger;
    }
    private updateOne(root: any, args: any, context: any, info: GraphQLResolveInfo): any {}
    private updateMany(root: any, args: any, context: any, info: GraphQLResolveInfo): any {}
    private deleteOne(root: any, args: any, context: any, info: GraphQLResolveInfo): any {}
    private deleteMany(root: any, args: any, context: any, info: GraphQLResolveInfo): any {}
}
