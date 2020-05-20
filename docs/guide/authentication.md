# Authentication

## Creating Users

`createUser` and `createManyUsers` mutations are where you can request creating users:

```graphql
mutation {
    createUser(data: { email: "carmen@myapp.com", name: "Carmen", family: "Sheperd", password: "secret", group: Admin }) {
        id
        createdAt
    }
}
```

According to the primitive `User` model, only admin users are authorized to create new users:

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

But it's customizable and you can edit access rules on your schema file:

```graphql
extend enum UserGroup {
    Editor
    Author
}

extend type User
    @model
    @authorization(
        CREATE: [Admin, Editor]
        READ: [Admin, "$user.id == {{id}}"]
        UPDATE: [Admin, "$user.id == {{id}}"]
        DELETE: [Admin] #
    ) {
    avatar: File @upload(accept: ["image/jpeg"], size: { max: "5", min: "0.1" })
}
```

Also, by removing `CREATE` rule you can allow anybody to create a user:

```graphql
extend type User
    @model
    @authorization(
        READ: [Admin, "$user.id == {{id}}"]
        UPDATE: [Admin, "$user.id == {{id}}"]
        DELETE: [Admin] #
    ) {
    avatar: File @upload(accept: ["image/jpeg"], size: { max: "5", min: "0.1" })
}
```

::: danger
In this case, the API needs to protect against DDOS attacks and it didn't implement yet.
:::
