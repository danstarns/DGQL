## Match Project

---

### Match Node & Project Connection Node

**Input GraphQL**

```graphql
{
    MATCH {
        user @node(label: User) {
            PROJECT {
                name
                posts @edge(type: HAS_POST, direction: OUT) {
                    post @node(label: Post) {
                        PROJECT {
                            content
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
            (user)-[:HAS_POST]->(post:Post) | {
                post: {
                    content: post.content
                }
            }
        ]
    } AS user
}

RETURN user
```

**Output Cypher params**

```params
{
    "params": {}
}
```

---

### Match Node & Project Connection Node (without label)

**Input GraphQL**

```graphql
{
    MATCH {
        user @node(label: User) {
            PROJECT {
                name
                posts @edge(type: HAS_POST, direction: OUT) {
                    post @node {
                        PROJECT {
                            content
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
            (user)-[:HAS_POST]->(post) | {
                post: {
                    content: post.content
                }
            }
        ]
    } AS user
}

RETURN user
```

**Output Cypher params**

```params
{
    "params": {}
}
```

---

### Match Node & Project Connection Properties

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
            (user)-[properties:HAS_POST]->(post:Post) | {
                properties: {
                    since: properties.since
                }
            }
        ]
    } AS user
}

RETURN user
```

**Output Cypher params**

```params
{
    "params": {}
}
```

---

### Match Node, and Project Connection Node plus Properties

**Input GraphQL**

```graphql
{
    MATCH {
        user @node(label: User) {
            PROJECT {
                name
                posts @edge(type: HAS_POST, direction: OUT) {
                    post @node(label: Post) {
                        PROJECT {
                            id
                        }
                    }
                    properties @relationship {
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
            (user)-[properties:HAS_POST]->(post:Post) | {
                post: {
                    id: post.id
                },
                properties: {
                    since: properties.since
                }
            }
        ]
    } AS user
}

RETURN user
```

**Output Cypher params**

```params
{
    "params": {}
}
```

---

### Match Multi Connected Node

**Input GraphQL**

```graphql
{
    MATCH {
        user @node(label: User) {
            PROJECT {
                name
                content @edge(type: HAS_CONTENT, direction: OUT) {
                    photo @node(label: Photo) {
                        PROJECT {
                            id
                            size
                            type
                            url
                        }
                    }
                    video @node(label: Video) {
                        PROJECT {
                            id
                            length
                            size
                            url
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
        content: [
            (user)-[:HAS_CONTENT]->(user_content) WHERE 'Photo' IN labels(user_content) OR 'Video' IN labels(user_content) | {
                photo: head([
                        user_content IN [user_content]
                        WHERE 'Photo' IN labels(user_content) |
                        {
                            id: user_content.id,
                            size: user_content.size,
                            type: user_content.type,
                            url: user_content.url
                        }
                    ]),
                video: head([
                        user_content IN [user_content]
                        WHERE 'Video' IN labels(user_content) |
                        {
                            id: user_content.id,
                            length: user_content.length,
                            size: user_content.size,
                            url: user_content.url
                        }
                    ])
            }
        ]
    } AS user
}

RETURN user
```

**Output Cypher params**

```params
{
    "params": {}
}
```

---

### Match Multi Connected Node + User Defined Where

**Input GraphQL**

```graphql
{
    MATCH {
        user @node(label: User) {
            PROJECT {
                name
                content @edge(type: HAS_CONTENT, direction: OUT) {
                    photo @node(label: Photo) {
                        WHERE {
                            id(equal: "photo-id")
                        }
                        PROJECT {
                            id
                            size
                            type
                            url
                        }
                    }
                    video @node(label: Video) {
                        WHERE {
                            id(equal: "video-id")
                        }
                        PROJECT {
                            id
                            length
                            size
                            url
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
        content: [
            (user)-[:HAS_CONTENT]->(user_content) WHERE 'Photo' IN labels(user_content) OR 'Video' IN labels(user_content) | {
                photo: head([
                        user_content IN [user_content]
                        WHERE 'Photo' IN labels(user_content) AND user_content.id = $params.user_content_photo_where_id_equal |
                        {
                            id: user_content.id,
                            size: user_content.size,
                            type: user_content.type,
                            url: user_content.url
                        }
                    ]),
                video: head([
                        user_content IN [user_content]
                        WHERE 'Video' IN labels(user_content) AND user_content.id = $params.user_content_video_where_id_equal |
                        {
                            id: user_content.id,
                            length: user_content.length,
                            size: user_content.size,
                            url: user_content.url
                        }
                    ])
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
        "user_content_photo_where_id_equal": "photo-id",
        "user_content_video_where_id_equal": "video-id"
    }
}
```

---

### Match Multi Connected Node + Relationship Properties

**Input GraphQL**

```graphql
{
    MATCH {
        user @node(label: User) {
            PROJECT {
                name
                content @edge(type: HAS_CONTENT, direction: OUT) {
                    photo @node(label: Photo) {
                        PROJECT {
                            id
                            size
                            type
                            url
                        }
                    }
                    video @node(label: Video) {
                        PROJECT {
                            id
                            length
                            size
                            url
                        }
                    }
                    properties @relationship {
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
        content: [
            (user)-[properties:HAS_CONTENT]->(user_content) WHERE 'Photo' IN labels(user_content) OR 'Video' IN labels(user_content) | {
                properties: { since: properties.since },
                photo: head([
                        user_content IN [user_content]
                        WHERE 'Photo' IN labels(user_content) |
                        {
                            id: user_content.id,
                            size: user_content.size,
                            type: user_content.type,
                            url: user_content.url
                        }
                    ]),
                video: head([
                        user_content IN [user_content]
                        WHERE 'Video' IN labels(user_content) |
                        {
                            id: user_content.id,
                            length: user_content.length,
                            size: user_content.size,
                            url: user_content.url
                        }
                    ])
            }
        ]
    } AS user
}

RETURN user
```

**Output Cypher params**

```params
{
    "params": {}
}
```

---

### Match Multi Connected Node + Relationship Properties With User Defined Where

**Input GraphQL**

```graphql
{
    MATCH {
        user @node(label: User) {
            PROJECT {
                name
                content @edge(type: HAS_CONTENT, direction: OUT) {
                    photo @node(label: Photo) {
                        PROJECT {
                            id
                            size
                            type
                            url
                        }
                    }
                    video @node(label: Video) {
                        PROJECT {
                            id
                            length
                            size
                            url
                        }
                    }
                    properties @relationship {
                        WHERE {
                            since(gt: "1999")
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
        content: [
            (user)-[properties:HAS_CONTENT]->(user_content) WHERE 'Photo' IN labels(user_content) OR 'Video' IN labels(user_content) AND properties.since > $params.user_content_properties_where_since_gt | {
                properties: { since: properties.since },
                photo: head([
                        user_content IN [user_content]
                        WHERE 'Photo' IN labels(user_content) |
                        {
                            id: user_content.id,
                            size: user_content.size,
                            type: user_content.type,
                            url: user_content.url
                        }
                    ]),
                video: head([
                        user_content IN [user_content]
                        WHERE 'Video' IN labels(user_content) |
                        {
                            id: user_content.id,
                            length: user_content.length,
                            size: user_content.size,
                            url: user_content.url
                        }
                    ])
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
        "user_content_properties_where_since_gt": "1999"
    }
}
```

---
