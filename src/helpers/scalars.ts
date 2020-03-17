import * as scalars from 'graphql-scalars';
import { GraphQLUpload } from 'graphql-upload';
import { scalarType } from 'nexus';
import { NexusScalarTypeDef } from 'nexus/dist/core';

const standardScalars = Object.keys(scalars)
    .map<NexusScalarTypeDef<string>>((key) => {
        if (scalars.hasOwnProperty(key) && /\w+Resolver$/.test(key)) {
            return scalarType(scalars[key]);
        }
    })
    .filter((scalar) => scalar);

export default [
    ...standardScalars,
    scalarType(GraphQLUpload),
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
];
