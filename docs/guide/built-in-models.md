# Built in Models

Which you can extend them or make a relation with them within your schema.

## User

```graphql
type User
    @model
    @authorization(
        READ: [Admin, "$user.id == {{id}}"] #
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
    avatar: File @upload(accept: ["image/jpeg", "image/png"], size: { max: "5", min: "0.1" })
}
```

## File

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

## UserGroup

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
