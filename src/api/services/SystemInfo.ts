import { ObjectDefinitionBlock } from '@nexus/schema/dist/core';
import { GraphQLResolveInfo } from 'graphql';
import { info } from '../../utils';
import { Model } from '../../database';

export class SystemInfo {
    constructor(private readonly userModel: Model) {}
    public generateQueries(t: ObjectDefinitionBlock<'Query'>) {
        t.field('system', {
            type: this.userModel.typeDefinition.schema.get('SystemInfo'),
            resolve: this.resolveInfo.bind(this),
        });
    }

    private async resolveInfo(root: any, credentials, context: any, resolverInfo: GraphQLResolveInfo) {
        return {
            version: info.version,
            adminUserExists: await this.userModel.datasource
                .count({ where: { group: 'Admin' } })
                .then((res) => res > 0),
            models: this.userModel.typeDefinition.schema.models.map((typeDefinition) => {
                return {
                    name: typeDefinition.name,
                    fields: typeDefinition.fields.map(
                        ({ name, typeName, isScalar, isString, readonly, relationType, config, values }) => {
                            return {
                                name,
                                isScalar,
                                relationType,
                                readonly,
                                isString,
                                type: typeName,
                                values,
                                list: config.list ? true : false,
                            };
                        },
                    ),
                };
            }),
        };
    }
}
