import { GraphQLResolveInfo } from 'graphql';
import { ObjectDefinitionBlock } from 'nexus/dist/core';
import * as pluralize from 'pluralize';
import { ObjectTypeDefinitionSummary } from 'src/helpers/ObjectTypeDefinitionSummary';
import Desolid from '../Desolid';
import { Type } from './Type';

export class Model extends Type {
    public static isModel(summary: ObjectTypeDefinitionSummary) {
        return summary.directives.filter((directive) => directive.name == 'model').length > 0;
    }
    public isModel = true;
    public generateQueries(t: ObjectDefinitionBlock<string>) {
        t.field(this.name.toLowerCase(), {
            type: Type.dictionary.get(this.name),
            resolve: this.findOne.bind(this),
        });
        t.list.field(pluralize(this.name.toLowerCase()), {
            type: Type.dictionary.get(this.name),
            resolve: this.find.bind(this),
        });
    }
    public generateMutations(t: ObjectDefinitionBlock<string>) {
        t.field(`create${this.name}`, {
            type: Type.dictionary.get(this.name),
            resolve: this.createOne.bind(this),
        });
        t.field(`update${this.name}`, {
            type: Type.dictionary.get(this.name),
            nullable: true,
            resolve: this.updateOne.bind(this),
        });
        t.list.field(`updateMany${pluralize(this.name)}`, {
            type: Type.dictionary.get(this.name),
            nullable: true,
            resolve: this.updateMany.bind(this),
        });
        t.field(`delete${this.name}`, {
            type: Type.dictionary.get(this.name),
            nullable: true,
            resolve: this.deleteOne.bind(this),
        });
        t.list.field(`deleteMany${pluralize(this.name)}`, {
            type: Type.dictionary.get(this.name),
            nullable: true,
            resolve: this.deleteMany.bind(this),
        });
    }
    private find(root: any, args: any, context: any, info: GraphQLResolveInfo): any {}
    private findOne(root: any, args: any, context: any, info: GraphQLResolveInfo): any {}
    private createOne(root: any, args: any, context: any, info: GraphQLResolveInfo): any {}
    private updateOne(root: any, args: any, context: any, info: GraphQLResolveInfo): any {}
    private updateMany(root: any, args: any, context: any, info: GraphQLResolveInfo): any {}
    private deleteOne(root: any, args: any, context: any, info: GraphQLResolveInfo): any {}
    private deleteMany(root: any, args: any, context: any, info: GraphQLResolveInfo): any {}
}
