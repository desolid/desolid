# Desolid: Minimalistic Headless CMS

Minimalistic Headless CMS

## CMS model

The CMS models using a graphql file `schema.graphql` in the root directory. here you can see a simple example:

```graphql
enum UserGroup {
    Admin # default
    User # default
    Editor
    Author
}

@Authorization(
    READ: "user.group = Editor || user.id = this.id",
    CREATE: "true",
    UPDATE: "user.group = Editor || user.id = this.id",
    DELETE: "user.group = Editor || user.id = this.id",
)
type User {
    id: ID!
    createdAt: DateTime! @createdAt
    updatedAt: DateTime! @updatedAt
    email: String! @unique
    phone: String @unique
    group: UserGroup!
    name: String!
    family: String!
    avatar: File
}

@Authorization(
    READ: "this.published || user.group = Editor || user.id = this.author",
    CREATE: "user.group in [Editor, Author]",
    UPDATE: "user.group = Editor || user.id = this.author",
    DELETE: "user.group = Editor || user.id = this.author",
)
type Post {
    id: ID!
    createdAt: DateTime! @createdAt
    updatedAt: DateTime! @updatedAt
    author: User!
    title: String!
    content: String!
    published: Boolean! @default(false)
    categories: [Category!]!
}

@Authorization(
    READ: "true",
    CREATE: "user.group = Editor",
    UPDATE: "user.group = Editor",
    DELETE: "user.group = Editor",
)
type Category {
    id: ID!
    createdAt: DateTime! @createdAt
    updatedAt: DateTime! @updatedAt
    name: String!
    posts: [Post!]!
}
```

## Primitive Scalars

-   ID
-   Int
-   Float
-   String
-   Datetime
-   Json
-   File

## Authorization

Authorization describes using `@Athorization` directive. you can indicate the logic using javascript boolean operators:

```graphql
@Authorization(
    READ: "this.published || user.group = Editor || user.id = this.author",
    CREATE: "user.group in [Editor, Author]",
    UPDATE: "user.group = Editor || user.id = this.author",
    DELETE: "user.group = Editor || user.id = this.author",
)
type Post {
    id: ID!
    createdAt: DateTime! @createdAt
    updatedAt: DateTime! @updatedAt
    author: User!
    title: String!
    content: String!
    published: Boolean! @default(false)
    categories: [Category!]!
}
```

2 objects are available in the scope:

-   `user`: refers to the authenticated user
-   `this`: refers to the selected model record
