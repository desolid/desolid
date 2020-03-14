import { Model } from 'src/entities/Model';
import { ObjectDefinitionBlock } from 'nexus/dist/core';
import * as pluralize from 'pluralize';
import { Type } from '../entities/Type';
import { GraphQLResolveInfo } from 'graphql';

export class ModelQuery {
    constructor(protected model: Model, protected t: ObjectDefinitionBlock<string>) {
        t.field(this.model.name.toLowerCase(), {
            type: Type.dictionary.get(this.model.name),
            resolve: this.findOne.bind(this),
        });
        t.list.field(pluralize(this.model.name.toLowerCase()), {
            type: Type.dictionary.get(this.model.name),
            resolve: this.find.bind(this),
        });
    }
    private find(root: any, args: any, context: any, info: GraphQLResolveInfo): any {
        debugger;
    }
    private findOne(root: any, args: any, context: any, info: GraphQLResolveInfo): any {
        debugger;
    }
}
