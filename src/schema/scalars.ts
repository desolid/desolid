import { GraphQLUpload } from 'graphql-upload';
import * as StandardScalars from 'graphql-scalars';
import { NexusScalarTypeDef, scalarType } from '@nexus/schema/dist/core';

export type Scalar =
    // primitives
    | 'ID'
    | 'Int'
    | 'Float'
    | 'Boolean'
    | 'DateTime'
    | 'String'
    // standard scalars
    | 'DateTime'
    | 'EmailAddress'
    | 'NegativeFloat'
    | 'NegativeInt'
    | 'NonNegativeFloat'
    | 'NonNegativeInt'
    | 'NonPositiveFloat'
    | 'NonPositiveInt'
    | 'PhoneNumber'
    | 'PositiveFloat'
    | 'PositiveInt'
    | 'PostalCode'
    | 'UnsignedFloat'
    | 'UnsignedInt'
    | 'URL'
    | 'ObjectID'
    | 'BigInt'
    | 'Long'
    | 'GUID'
    | 'HexColorCode'
    | 'HSL'
    | 'HSLA'
    | 'IPv4'
    | 'IPv6'
    | 'ISBN'
    | 'MAC'
    | 'Port'
    | 'RGB'
    | 'RGBA'
    | 'USCurrency'
    | 'JSON'
    | 'JSONObject'
    // custome scalars
    | 'Upload'
    | 'Password';

export const scalarTypes: Scalar[] = [
    // primitives
    'ID',
    'Int',
    'Float',
    'Boolean',
    'DateTime',
    'String',
    // standard scalars
    'DateTime',
    'EmailAddress',
    'NegativeFloat',
    'NegativeInt',
    'NonNegativeFloat',
    'NonNegativeInt',
    'NonPositiveFloat',
    'NonPositiveInt',
    'PhoneNumber',
    'PositiveFloat',
    'PositiveInt',
    'PostalCode',
    'UnsignedFloat',
    'UnsignedInt',
    'URL',
    'ObjectID',
    'BigInt',
    'Long',
    'GUID',
    'HexColorCode',
    'HSL',
    'HSLA',
    'IPv4',
    'IPv6',
    'ISBN',
    'MAC',
    'Port',
    'RGB',
    'RGBA',
    'USCurrency',
    'JSON',
    'JSONObject',
    // custome scalars
    'Upload',
    'Password',
];

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
        description: '@todo describe',
        /**
         * @todo implement
         */
        serialize(value) {
            debugger;
        },

        /**
         * @todo implement
         */
        parseValue(value) {
            debugger;
        },

        /**
         * @todo implement
         */
        parseLiteral(value) {
            debugger;
        },
    }),
);

export const stringScalars = [
    // primitives
    'String',
    // standard scalars
    'EmailAddress',
    'PhoneNumber',
    'PostalCode',
    'URL',
    'HexColorCode',
    'HSL',
    'HSLA',
    'IPv4',
    'IPv6',
    'ISBN',
    'MAC',
    'RGB',
    'RGBA',
];
