# DGQL/language/Pagination

## Intro

Use to skip limit and sort node and edges.

## Usage

### `SORT`

```graphql
{
    MATCH {
        user @node(label: User) {
            SORT {
                id(direction: DESC)
            }
        }
    }
    RETURN {
        user
    }
}
```

### `SKIP` + `LIMIT`

```graphql
{
    MATCH {
        user @node(label: User) @paginate(skip: 10, limit: 10)
    }
    RETURN {
        user
    }
}
```

### `SKIP` + `LIMIT` + `SORT` on connected nodes

```graphql
{
    MATCH {
        user @node(label: User) {
            PROJECT {
                posts
                    @edge(type: HAS_POST, direction: OUT)
                    @paginate(skip: 1, limit: 10) {
                    post @node {
                        SORT {
                            createdAt(direction: DESC)
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
