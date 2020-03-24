import { scalarType } from 'nexus';
import { GraphQLUpload } from 'graphql-upload';
import * as StandardScalars from 'graphql-scalars';
import { NexusScalarTypeDef } from 'nexus/dist/core';

export const scalars = Object.keys(StandardScalars)
    .map<NexusScalarTypeDef<string>>((key) => {
        if (StandardScalars.hasOwnProperty(key) && /\w+Resolver$/.test(key)) {
            return scalarType(StandardScalars[key]);
        }
    })
    .filter((scalar) => scalar);

scalars.push(scalarType(GraphQLUpload));
scalars.push(
    scalarType({
        name: 'Password',
        description: 'TODO: describe',
        serialize(value) {
            /* Todo */
            debugger;
        },
        parseValue(value) {
            /* Todo */
            debugger;
        },
        parseLiteral(value) {
            /* Todo */
            debugger;
        },
    }),
);
