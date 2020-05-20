# Authentication

Desolid authenticates users by [JSON Web Tokens](https://jwt.io/introduction/) (JWT). Whenever the user wants to access a protected route or resource, the user agent should send the JWT, in the `Authorization` header using the Bearer schema. The content of the header should look like the following:

```bash
Authorization: Bearer <token>
```

## Requesting a Token

For generating a token you can query to the `authenticate` api:

```graphql
authenticate(email:"carmen@example.com", password:"secret") {
    token
    user {
        id
        name
        avatar {
            url
        }
    }
}
```

## Configuration

Generated Token will expire in by default 48 hours. the value is customizable on the `authentication` section of the config file:

```yaml{5}
api:
    port: 3000
    authentication:
        secret: 'secret'
        expiration: 24 # hours
    upload:
        maxFileSize: 64 # MB
```

### Custom Credential field

You can add any custom credential field by adding those with `@unique` directive to the `User` model extension:

```graphql{9}
extend type User
    @model
    @authorization(
        CREATE: [Admin]
        READ: [Admin, "$user.id == {{id}}"]
        UPDATE: [Admin, "$user.id == {{id}}"]
        DELETE: [Admin] #
    ) {
    phone: PhoneNumber! @unique
}
```

These new fields will come on the `authenticate` API automatically.

## Creating Users

### Initial Admin user

`createUser` and `createManyUsers` mutations are where you can request creating users:

```graphql
mutation {
    createUser(data: { email: "carmen@example.com", name: "Carmen", password: "secret", group: Admin }) {
        id
        createdAt
    }
}
```

According to the primitive `User` model, only admin users are authorized to create new users:

```graphql{4}
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

```graphql{9}
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

::: tip
The known issue here is that, you don't can change authorisation rulls of the `User` model without adding or overriding a new field.
:::


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
