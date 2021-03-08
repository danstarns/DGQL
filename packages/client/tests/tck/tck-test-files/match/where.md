## Match Where

---

### Match Node with Where

**Input GraphQL**

```graphql
{
    MATCH {
        user @node(label: User) {
            WHERE {
                name(equal: Dan)
            }
            RETURN {
                name
            }
        }
    }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (user:User)
    WHERE user.name = $params.user_where_name_equal
    RETURN user { name: user.name } AS user
}

RETURN user
```

**Output Cypher params**

```params
{
    "params": {
        "user_where_name_equal": "Dan"
    }
}
```

---

### Match nested Node with Where

**Input GraphQL**

```graphql
{
    MATCH {
        user @node(label: User) {
            RETURN {
                name
                posts @edge(type: HAS_POST, direction: OUT) {
                    post @node(label: Post) {
                        WHERE {
                            title(equal: "Beer")
                        }
                        RETURN {
                            title
                        }
                    }
                }
            }
        }
    }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (user:User)
    RETURN user {
        name: user.name,
        posts: [
            (user)-[:HAS_POST]->(post:Post) WHERE post.title = $params.user_posts_post_where_title_equal | {
                post: { title: post.title }
            }
        ]
    } AS user
}

RETURN user
```

**Output Cypher params**

```params
{
    "params": {
        "user_posts_post_where_title_equal": "Beer"
    }
}
```

---

### Match nested Relationship properties with Where

**Input GraphQL**

```graphql
{
    MATCH {
        user @node(label: User) {
            RETURN {
                name
                posts @edge(type: HAS_POST, direction: OUT) {
                    post @node(label: Post)
                    properties @relationship {
                        WHERE {
                            since(equal: "1999")
                        }
                        RETURN {
                            since
                        }
                    }
                }
            }
        }
    }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (user:User)
    RETURN user {
        name: user.name,
        posts: [
            (user)-[properties:HAS_POST]->(post:Post) WHERE properties.since = $params.user_posts_properties_where_since_equal | {
                properties: { since: properties.since }
            }
        ]
    } AS user
}

RETURN user
```

**Output Cypher params**

```params
{
    "params": {
        "user_posts_properties_where_since_equal": "1999"
    }
}
```

---

### Match both nested Node & Relationship properties with Where

**Input GraphQL**

```graphql
{
    MATCH {
        user @node(label: User) {
            RETURN {
                name
                posts @edge(type: HAS_POST, direction: OUT) {
                    post @node(label: Post) {
                        WHERE {
                            title(equal: "Beer")
                        }
                        RETURN {
                            title
                        }
                    }
                    properties @relationship {
                        WHERE {
                            since(equal: "1999")
                        }
                        RETURN {
                            since
                        }
                    }
                }
            }
        }
    }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (user:User)
    RETURN user {
        name: user.name,
        posts: [
            (user)-[properties:HAS_POST]->(post:Post) WHERE post.title = $params.user_posts_post_where_title_equal AND properties.since = $params.user_posts_properties_where_since_equal | {
                post: { title: post.title },
                properties: { since: properties.since }
            }
        ]
    } AS user
}

RETURN user
```

**Output Cypher params**

```params
{
    "params": {
        "user_posts_properties_where_since_equal": "1999",
        "user_posts_post_where_title_equal": "Beer"
    }
}
```

---