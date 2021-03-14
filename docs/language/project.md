# DGQL/language/`PROJECT`

## Intro

Maybe you have called [`MATCH`](./match) and want to select properties on the matched node or relationship; `PROJECT` is the tool for you.

Take the big 'node object', returned from Neo4j Javascript Driver, and `PROJECT` it into a usable, JSON like, structure - Perfect for application use.

```graphql
{
    MATCH {
        users @node(label: User) {
            PROJECT {
                name
            }
        }
    }
    RETURN {
        users
    }
}
```

## Usage

### `MATCH` and `PROJECT` edge node

```graphql
{
    MATCH {
        user @node(label: User) {
            PROJECT {
                name
                posts @edge(type: HAS_POST, direction: OUT) @node(label: Post) {
                    title
                }
            }
        }
    }
}
```

### `MATCH` and `PROJECT` many nodes on an edge

```graphql
{
    MATCH {
        user @node(label: User) {
            PROJECT {
                name
                content @edge(type: HAS_CONTENT, direction: OUT) {
                    photo @node(label: Photo) {
                        PROJECT {
                            size
                            type
                            base64
                        }
                    }
                    video @node(label: Video) {
                        PROJECT {
                            thumbnail
                            length
                            url
                        }
                    }
                    post @node(label: Post) {
                        PROJECT {
                            title
                            content
                        }
                    }
                }
            }
        }
    }
}
```

### `MATCH` and `PROJECT` edge properties

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
}
```
