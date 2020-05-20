# Built in Models

Which you can extend them or make a relation with them within your schema.

## Models

### User

```graphql
type User
    @model
    @authorization(
        CREATE: [Admin]
        READ: [Admin, "$user.id == {{id}}"]
        UPDATE: [Admin, "$user.id == {{id}}"]
        DELETE: [Admin]
    ) {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    email: EmailAddress! @unique
    password: Password!
    group: UserGroup!
    name: String!
}
```

### File

```graphql
"""
Base File Model
"""
type File
    @model
    @authorization(
        CREATE: [Admin] #
        UPDATE: [Admin]
        DELETE: [Admin]
    ) {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    name: String!
    mimetype: String!
    size: Int # Bytes
    path: String! @unique
}
```

## Enums

### UserGroup

```graphql
enum UserGroup {
    """
    System Administrator
    """
    Admin
    """
    Authenticated User
    """
    User
}
```

## Extending Built in Models/Enums

You can extend any one of built in models. just notice 3 things:

- Attributes (columns) of the model will merge with base
- All directives of the new will shallow merge with the base ones
- Enum items will append to the base

::: tip
The known issue here is that, you don't can change directives (including `authorization` rulls) of any model without adding or overriding a new field.
:::