# Introduction

Have you ever wanted to have a direct dive from your business plan analysis to a simple ready to use backend service?

[Desolid](https://desolid.netlify.app/) is an opinionated backend as a service. the project aimed to cut the distance between the ideas and reality as much as possible. It's currently still under development but the first alpha release is now available. although this version of the code is an early alpha release and should not be used for production implementations.

The core imagination is to have a human-readable single file that describes both of the data model and logic and [Desolid](https://desolid.netlify.app/) will serve the desired API based on that single file. It shouldn't ask (by default) any configuration for handling files or accessing any database, all must be satisfied by the [Desolid](https://desolid.netlify.app/) itself.

[Desolid](https://desolid.netlify.app/) provides a GraphQL API and an admin panel based on the schema file. it creates and uses an SQLite database and local file storage for storing the data and files.

It also supports other kinds of SQL databases like Postgres, MySQL, and MS SQL Server instead of SQLite or any S3 services instead of local file storage.

Let's see how is it, suppose we wanna make a simple blog service, we have Users, Posts, Categories as entities of the system.

## Create the schema file

As explained above we just need a single file to describe and run the backend so let go ahead and make that in an empty:

```bash
touch schema.graphql
```

## Create the Categories model

Models define using [GraphQL type objects](https://graphql.org/learn/schema/#object-types-and-fields), so properties will represent as fields and logics will define using directives. so let's edit the schema file, I'm using VS Code (you can choose anyone you want). it open with this:

```bash
code .
```

Then copy & paste this and save the file:

```graphql
type Category @model {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    name: String!
}
```

## Start Desolid

So far we just defined a model on the schema file, we can start [Desolid](https://desolid.netlify.app/) to see what happens:

```bash
npx desolid
```

We should see:

```
  ____                         _   _       _
 |  _ \    ___   ___    ___   | | (_)   __| |
 | | | |  / _ \ / __|  / _ \  | | | |  / _` |
 | |_| | |  __/ \__ \ | (_) | | | | | | (_| |
 |____/   \___| |___/  \___/  |_| |_|  \__,_|

🤖 [Desolid](https://desolid.netlify.app/): Single file self-hosted backend as a service
🔥 v0.4.0 running in "win32" on "E:\opensource\desolid\desolid\test"

[2020-06-27 02:17:24]  INFO  Compiling Schema ...
[2020-06-27 02:17:25]  WARN  Authentication Secret value didn't set into the configuration file. the generated JWT tokens will expire on every restart.
[2020-06-27 02:17:25]  INFO  Connecting to database ...
[2020-06-27 02:17:25]  INFO  Connected to "sqlite://./databse.sqlite"
[2020-06-27 02:17:25]  INFO  Starting server ...
[2020-06-27 02:17:25]  INFO  Server is running on http://localhost:3000
[2020-06-27 02:17:25]  INFO  Amin panel is available on http://localhost:3000/admin
[2020-06-27 02:17:25]  INFO  🚀 in 474ms
```

Also on the root directory, we have two new generated files:

-   `database.sqlite`: the database
-   `desolid.log`: persists the logs in JSON format

Now open [http://localhost:3000](http://localhost:3000) in the browser, as you see we have a GraphQL playground to try the API:

![[Desolid](https://desolid.netlify.app/) playground](https://dev-to-uploads.s3.amazonaws.com/i/u7ugiyh6cyot7slat43r.png)

[Desolid](https://desolid.netlify.app/) generates a standard CRUD for all models, including handling complex queries, various mutations, standard aggregations, and file uploads. we are planning to reach all features of [Open CRUD](https://www.opencrud.org/) specifications but it's still under development. Also, CRUDs will consider authorization logics which are described in the schema file.

Now open [http://localhost:3000/admin](http://localhost:3000/admin) in the browser, it's the builtin simple admin panel of [Desolid](https://desolid.netlify.app/). Here You can view, create, edit & remove records:

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/khusm2gidgdqogfrc5nt.png)

As you see the admin panel redirects us to the signup page automatically. it's because there is no admin user-defined so far in the system, so let create one and sign in to the dashboard:

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/y2ttwddlychoa319f0e8.png)

Also, you can create a category using the admin panel:

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/dzon1j575yaih1x7lhjc.png)

## Protect Categories model

Now we have to make some constraints on our category model, for example, only Editors have permission to create, update or delete a category, let's see how we can.

First we need to take a look to the builtin User model of [Desolid](https://desolid.netlify.app/) (builtin type are the types which [Desolid](https://desolid.netlify.app/) prepends them to our schema file):

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

Just note the `group` field, for now, it defines the `UserGroup` that the user belongs to, so What are available `UserGroup`s? by default [Desolid](https://desolid.netlify.app/) has `Admin` and `User` as the available user groups:

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

Now let's add our custom required `UserGroup`s, `Editor`, and `Author`. it will be by extending the `UserGroup`, add these lines of codes to the top of your `schema.graphql` file:

```graphql
extend enum UserGroup {
    Editor
    Author
}
```

So our file will be like:

```graphql
extend enum UserGroup {
    Editor
    Author
}

type Category @model {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    name: String!
}
```

Now we have to authorize requests to our Category model using the `@authorization` directive:

```graphql
type Category
    @model
    @authorization(
        CREATE: [Admin, Editor]
        UPDATE: [Admin, Editor]
        DELETE: [Admin, Editor] #
    ) {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    name: String!
}
```

It says that only members of `Admin`s & `Editor`s groups have permission to create, update or delete a Category.

## Relations

Let's continue with creating the Post model:

```graphql
type Post
    @model
    @authorization(
        READ: [Admin, Editor, "{{published}} || $user.id == {{author.id}}"]
        CREATE: [Admin, Editor, "$user.group == 'Author' && !$input.published"]
        UPDATE: [Admin, Editor, "$user.id == {{author.id}} && !$input.published"]
        DELETE: [Admin, Editor, "!{{published}} && $user.id == {{author.id}}"] #
    ) {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    author: User!
    title: String!
    content: String!
    published: Boolean!
    categories: [Category]
}
```

Wait, wait, don't fear, I'm here 🤓, the authorization logic is a bit complex for Posts, let's check it one by one:

<center>
    <img src="https://i.giphy.com/media/6heBQSjt2IoA8/giphy.gif"/>
</center>

-   **READ**: If you are a member of Admins or Editors you are passed, also if you are not but the post is `published` or not `published` but you're the author you are passed too.

-   **CREATE**: If you are a member of Admins or Editors you are passed, also if you are not but you are a member of Authors and the post you wanna create is not set as `published`, (because of course an Editor must revise and approve your post before putting in the front) then you are welcome too.

-   **UPDATE**: If you are a member of Admins or Editors you are passed, also if you are not but you are a member of Authors and the you are the owner of the post then you are passed too. just don't try to update `published`, because you not allowed for.

-   **DELETE**: If you are a member of Admins or Editors you are passed, also if you are not but you are a member of the Authors and you are the owner of the post and the post didn't publish yet, then you are passed too.

So let's return to relations, look at the type of `categories` field, It's a list of Categories. [Desolid](https://desolid.netlify.app/) handles relations automatically on the data layer based on the model's structures. so for helping [Desolid](https://desolid.netlify.app/) to realize this relation better, let's update Category model too:

```graphql
type Category
    @model
    @authorization(
        CREATE: [Admin, Editor]
        UPDATE: [Admin, Editor]
        DELETE: [Admin, Editor] #
    ) {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    name: String!
    posts: [Post]
}
```

Now [Desolid](https://desolid.netlify.app/) knows that this relation is a `many-to-many` one and handles it in the right way.

## Extending builtin types

Suppose now we need to have an avatar per each user, the builtin `User` model doesn't have suche a field as you saw before. so we have to extent the `User` model on our schema file. Maybe not bad to update the authorization rulls to allow Editors to create new users too:

```graphql
extend type User
    @model
    @authorization(
        CREATE: [Admin, Editor]
        READ: [Admin, "$user.id == {{id}}"]
        UPDATE: [Admin, "$user.id == {{id}}"]
        DELETE: [Admin] #
    ) {
    avatar: File @upload(accept: ["image/jpeg"], size: { max: 5, min: 0.1 })
}
```

As you see we added a new field to the `User` model. the type of `avatar` is declared as `File`. `File` is the other builtin type which will inclde by defualt. You may guess that here we have another relation type. [Desolid](https://desolid.netlify.app/) considers relations to the `File` model as a `many-to-one` relation.

Using the `@upload` directive we indicated some extra constraints too, an avatar should be `image/jpeg` and teh size must be between 0.1 to 5 MB.

So far our schema file should be like this:

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
    avatar: File @upload(accept: ["image/jpeg"], size: { max: 5, min: 0.1 })
}

type Post
    @model
    @authorization(
        READ: [Admin, Editor, "{{published}} || $user.id == {{author.id}}"]
        CREATE: [Admin, Editor, "$user.group == 'Author' && !$input.published"]
        UPDATE: [Admin, Editor, "$user.id == {{author.id}} && !$input.published"]
        DELETE: [Admin, Editor, "!{{published}} && $user.id == {{author.id}}"] #
    ) {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    author: User!
    title: String!
    content: String!
    published: Boolean!
    categories: [Category]
}

type Category
    @model
    @authorization(
        CREATE: [Admin, Editor]
        UPDATE: [Admin, Editor]
        DELETE: [Admin, Editor] #
    ) {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    name: String!
    posts: [Post]
}
```

## Configuration

I was trying to keep [Desolid](https://desolid.netlify.app/) executable with just a single file by considering some light default confiurations with no dependencies. but the configuration is cusomizable, you can connect desolid to an extenal database or S3 file storage service. it's poosible using the `desolid.yaml` file next to the schema file. like:

```yaml
database:
    dialect: 'sqlite'
    storage: '/db/databse.sqlite'
    logging: false
    forceSync: false

api:
    port: 3000
    authentication:
        secret: 'secret'
        expiration: 48 ## hours
    upload:
        maxFileSize: 64 ## MB

storage:
    pattern: '/${YYYY}/${MM}/${DD}/${NAME}-${EPOCH}.${EXT}'
    driver: 's3'
    config:
        ## AWS
        key: 'AWS_S3_KEY'
        secret: 'AWS_S3_SECRET'
        region: 'AWS_S3_REGION'
        bucket: 'AWS_S3_BUCKET'
```

## Contribution

Any contribution to [Desolid](https://desolid.netlify.app/) is more than welcome!

A great way to contribute to the project is to send a detailed report when you encounter an issue. We'd love to see your pull requests, even if it's just to fix a typo!

## Road map

-   Database Migrations
-   Embeded [Desolid](https://desolid.netlify.app/) and Extentions
-   Docker image & Cloud Native behaviuors
-   Developing Admin panel missed functionalities
