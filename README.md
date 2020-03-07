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

type User
    @model
    @authorization(
        READ: "$user.group = Editor || $user.id = $this.id"
        CREATE: "true"
        UPDATE: "$user.group = Editor || $user.id = $this.id"
        DELETE: "$user.group = Editor || $user.id = $this.id"
    ) {
    id: ID! @auto
    createdAt: DateTime! @createdAt
    updatedAt: DateTime! @updatedAt
    email: Email! @unique
    phone: PhoneNumber @unique
    password: Password! @validation(length: { min: 12, max: 25 })
    group: UserGroup!
    name: String!
    family: String!
    avatar: File @upload(accept: "imagee/*", size: { max: "5MB", min: "10KB" })
}

type Post
    @model
    @authorization(
        READ: "$this.published || $user.group = Editor || $user.id = $this.author"
        CREATE: "$user.group in [Editor, Author]"
        UPDATE: "$user.group = Editor || $user.id = $this.author"
        DELETE: "$user.group = Editor || $user.id = $this.author"
    ) {
    id: ID! @auto
    createdAt: DateTime! @createdAt
    updatedAt: DateTime! @updatedAt
    author: User!
    title: String!
    content: String!
    published: Boolean! @default(value: false) @authorize(READ: "$user.group in [Editor, Author]")
    categories: [Category!]!
}

type Category
    @model
    @authorization(
        READ: "true"
        CREATE: "$user.group = Editor"
        UPDATE: "$user.group = Editor"
        DELETE: "$user.group = Editor"
    ) {
    id: ID! @auto
    createdAt: DateTime! @createdAt
    updatedAt: DateTime! @updatedAt
    name: String!
    posts: [Post!]!
}
```

## Usgae

TODO: describe

### Node

```bash
npm install -g desolid
```

### Docker

#### Docker Compose

## Global Variables

-   `$now` refers to current DateTime
-   `$user`refers to the authenticated user
-   `$this` refers to the current model

## Primitive Scalars

-   ID
-   Int
-   Float
-   String
-   Boolean

# Built in Scalars

-   Datetime
-   Password
-   PhoneNumber
-   Email
-   Json

# Built in Types

-   Resource
-   SoftDeleteResource

# Built in Models

-   User
-   File

## Authorization

Authorization describes using `@Athorization` directive. you can indicate the logic using javascript boolean operators:

```graphql
type Post
    @model
    @authorization(
        READ: "$this.published || $user.group = Editor || $user.id = $this.author"
        CREATE: "$user.group in [Editor, Author]"
        UPDATE: "$user.group = Editor || $user.id = $this.author"
        DELETE: "$user.group = Editor || $user.id = $this.author"
    ) {
    id: ID! @auto
    createdAt: DateTime! @createdAt
    updatedAt: DateTime! @updatedAt
    author: User!
    title: String!
    content: String!
    published: Boolean! @default(value: false) @authorize(READ: "$user.group in [Editor, Author]")
    categories: [Category!]!
}
```

2 variables are available in the scope:

-   `$user`: refers to the authenticated user
-   `$this`: refers to the current model
