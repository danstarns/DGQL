# DGQL/language/Fragments

GraphQL has a feature called [Fragments](http://spec.graphql.org/June2018/#sec-Language.Fragments) that allows one, who is writing the query, to define a selection set that can be reused.

Looking at the below query:

```graphql
{
  MATCH {
    users @node(label: User) {
      PROJECT {
        id
        name
        createdAt
        updatedAt
      }
    }
    posts @node(label: Post) {
      PROJECT {
        id
        title
        createdAt
        updatedAt
      }
    }
  }
  RETURN {
    users
    posts
  }
}
```

A few properties are repeated. With DGQL you can use fragments, below defines a fragment `MyFragment` and spreads that on each node we match:

```graphql
{
  MATCH {
    users @node(label: User) {
      PROJECT {
        ...MyFragment
        name
      }
    }
    posts @node(label: Post) {
      PROJECT {
        ...MyFragment
        title
      }
    }
  }
  RETURN {
    users
    posts
  }
}

fragment MyFragment on DGQL {
  id
  createdAt
  updatedAt
}
```

What's cool about this is that, because in DGQL everything is a selection set(for the most part), you can use fragments on all operations. The below example updates a user and a post, and for both uses the fragment to create and connect to a new audit node.

```graphql
{
  UPDATE {
    users @node(label: User) {
      WHERE {
        name(equal: "Daniel")
      }
      SET {
        name(value: "Dan")
      }
      ...Audit
    }
    posts @node(label: Post) {
      WHERE {
        title(equal: "DGQL is cool")
      }
      SET {
        title(value: "DGQL is super cool")
      }
      ...Audit
    }
  }
}

fragment Audit on DGQL {
  CREATE @edge(type: HAS_UPDATE, direction: OUT) {
    NODE(label: Audit) {
      SET {
        id @uuid
        createdAt @datetime
      }
    }
  }
}
```

Below is another example using CREATE. The query creates a post and a comment and ensures, using the fragment, that each is connected to the creator. You will also notice two fragments and the second one `Fields` is used to ensure that the id and timestamp is applied to each node we create.

```graphql
{
  CREATE {
    posts @node(label: Post) {
      SET {
        title(value: "DGQL is super super cool!")
        ...Fields
      }
      CREATE @edge(type: HAS_COMMENT, direction: OUT) {
        NODE(label: Comment) {
          SET {
            content(value: "First Comment")
            ...Fields
          }
          ...Author
        }
      }
      ...Author
    }
  }
}

fragment Author on DGQL {
  CONNECT @edge(type: AUTHORED, direction: IN) {
    NODE(label: User) {
      WHERE {
        name(equal: "Dan")
      }
    }
  }
}

fragment Fields on DGQL {
  id @uuid
  createdAt @datetime
}
```

The eagle eye may have noticed `on DGQL`. This is due to the fact GraphQL requires there to be an `on X`. Using `DGQL` is essentially a little hack.
