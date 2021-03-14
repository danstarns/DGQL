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
            PROJECT {
                name
            }
        }
    }
    RETURN {
        user
    }
}
```

**Output Cypher**

```cypher
CALL {
    MATCH (user:User)
    WHERE user.name = $params.user_where_name0_equal
    RETURN user { name: user.name } AS user
}

RETURN user
```

**Output Cypher params**

```params
{
    "params": {
        "user_where_name0_equal": "Dan"
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
            PROJECT {
                name
                posts @edge(type: HAS_POST, direction: OUT) {
                    post @node(label: Post) {
                        WHERE {
                            title(equal: "Beer")
                        }
                        PROJECT {
                            title
                        }
                    }
                }
            }
        }
    }
    RETURN {
        user
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
            (user)-[:HAS_POST]->(post:Post) WHERE post.title = $params.user_posts_post_where_title0_equal | {
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
        "user_posts_post_where_title0_equal": "Beer"
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
            PROJECT {
                name
                posts @edge(type: HAS_POST, direction: OUT) {
                    post @node(label: Post)
                    properties @relationship {
                        WHERE {
                            since(equal: "1999")
                        }
                        PROJECT {
                            since
                        }
                    }
                }
            }
        }
    }
    RETURN {
        user
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
            (user)-[properties:HAS_POST]->(post:Post) WHERE properties.since = $params.user_posts_properties_where_since0_equal | {
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
        "user_posts_properties_where_since0_equal": "1999"
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
            PROJECT {
                name
                posts @edge(type: HAS_POST, direction: OUT) {
                    post @node(label: Post) {
                        WHERE {
                            title(equal: "Beer")
                        }
                        PROJECT {
                            title
                        }
                    }
                    properties @relationship {
                        WHERE {
                            since(equal: "1999")
                        }
                        PROJECT {
                            since
                        }
                    }
                }
            }
        }
    }
    RETURN {
        user
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
            (user)-[properties:HAS_POST]->(post:Post) WHERE post.title = $params.user_posts_post_where_title0_equal AND properties.since = $params.user_posts_properties_where_since0_equal | {
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
        "user_posts_properties_where_since0_equal": "1999",
        "user_posts_post_where_title0_equal": "Beer"
    }
}
```

---
