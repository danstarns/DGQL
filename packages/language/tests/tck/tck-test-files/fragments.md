## Fragments

---

### Simple MATCH

**Input GraphQL**

```graphql
{
  MATCH {
    ...Frag
  }
}

fragment Frag on DGQL {
  node @node
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (node)
    RETURN node
}

RETURN COUNT(*)
```

**Output Cypher params**

```params
{
    "params": {}
}
```

---

### Simple PROJECT

**Input GraphQL**

```graphql
{
  MATCH {
    node @node {
      PROJECT {
        ...Projection
      }
    }
  }
}

fragment Projection on DGQL {
  id
  name
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (node)
    RETURN node { id: node.id, name: node.name } AS node
}

RETURN COUNT(*)
```

**Output Cypher params**

```params
{
    "params": {}
}
```

---

### Advanced MATCH

**Input GraphQL**

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

**Output Cypher**

```cypher
CALL {
    MATCH (users:User)
    RETURN users {
        name: users.name,
        id: users.id,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
    } AS users
}

CALL {
    MATCH (posts:Post)
    RETURN posts {
        title: posts.title,
        id: posts.id,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt
    } AS posts
}

RETURN users, posts
```

**Output Cypher params**

```params
{
    "params": {}
}
```

---

### Advanced CREATE

**Input GraphQL**

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

**Output Cypher**

```cypher
CALL {
    CREATE (posts:Post)
    SET posts.title = $params.posts_set_title
    SET posts.id = randomUUID()
    SET posts.createdAt = datetime()
    WITH posts
    CALL {
        CREATE (posts_create1_NODE:Comment)
        SET posts_create1_NODE.content = $params.posts_create1_NODE_set_content
        SET posts_create1_NODE.id = randomUUID()
        SET posts_create1_NODE.createdAt = datetime()
        WITH posts_create1_NODE
        CALL {
            WITH posts_create1_NODE
            OPTIONAL MATCH (posts_create1_NODE_connect1_NODE:User)
            WHERE posts_create1_NODE_connect1_NODE.name = $params.posts_create1_NODE_connect1_NODE_where_name0_equal
            CALL apoc.do.when(posts_create1_NODE_connect1_NODE IS NOT NULL, "
                MERGE (posts_create1_NODE)<-[:AUTHORED]-(posts_create1_NODE_connect1_NODE)
            " , "" , { params: $params, posts_create1_NODE_connect1_NODE: posts_create1_NODE_connect1_NODE, posts_create1_NODE: posts_create1_NODE } ) YIELD value as _
            RETURN COUNT(*)
        }
        RETURN posts_create1_NODE
    }

    MERGE (posts)-[:HAS_COMMENT]->(posts_create1_NODE)
    WITH posts
    CALL {
        WITH posts
        OPTIONAL MATCH (posts_connect2_NODE:User)
        WHERE posts_connect2_NODE.name = $params.posts_connect2_NODE_where_name0_equal
        CALL apoc.do.when(posts_connect2_NODE IS NOT NULL, "
            MERGE (posts)<-[:AUTHORED]-(posts_connect2_NODE)
        " , "" , { params: $params, posts_connect2_NODE: posts_connect2_NODE, posts: posts } ) YIELD value as _
        RETURN COUNT(*)
    }

    RETURN posts
}

RETURN COUNT(*)
```

**Output Cypher params**

```params
{
  "params": {
    "posts_set_title": "DGQL is super super cool!",
    "posts_create1_NODE_set_content": "First Comment",
    "posts_create1_NODE_connect1_NODE_where_name0_equal": "Dan",
    "posts_connect2_NODE_where_name0_equal": "Dan"
  }
}
```

---

### Advanced UPDATE

**Input GraphQL**

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

**Output Cypher**

```cypher
CALL {
    OPTIONAL MATCH (users:User)
    WHERE users.name = $params.users_where_name0_equal
    CALL apoc.do.when(users IS NOT NULL, "
        SET users.name = $params.users_set_name
        WITH users
        CALL {
            CREATE (users_create2_NODE:Audit)
            SET users_create2_NODE.id = randomUUID()
            SET users_create2_NODE.createdAt = datetime()
            RETURN users_create2_NODE
        }
        MERGE (users)-[:HAS_UPDATE]->(users_create2_NODE)
        RETURN users
    " , "" , { params: $params, users: users } ) YIELD value AS _

    RETURN users
}

CALL {
    OPTIONAL MATCH (posts:Post)
    WHERE posts.title = $params.posts_where_title0_equal
    CALL apoc.do.when(posts IS NOT NULL, "
        SET posts.title = $params.posts_set_title
        WITH posts
        CALL {
            CREATE (posts_create2_NODE:Audit)
            SET posts_create2_NODE.id = randomUUID()
            SET posts_create2_NODE.createdAt = datetime()
            RETURN posts_create2_NODE
        }
        MERGE (posts)-[:HAS_UPDATE]->(posts_create2_NODE)
        RETURN posts
    " , "" , { params: $params, posts: posts } ) YIELD value AS _

    RETURN posts
}

RETURN COUNT(*)
```

**Output Cypher params**

```params
{
  "params": {
    "users_where_name0_equal": "Daniel",
    "users_set_name": "Dan",
    "posts_where_title0_equal": "DGQL is cool",
    "posts_set_title": "DGQL is super cool"
  }
}
```

---
