import { scalarType } from 'nexus';
import { GraphQLUpload } from 'graphql-upload';
import * as StandardScalars from 'graphql-scalars';
import { NexusScalarTypeDef } from 'nexus/dist/core';

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
