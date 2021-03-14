# DGQL/language/`RETURN`

## Intro

Maybe you have called [`MATCH`](./match) and want to return the value. Use the `RETURN` keyword, and reference all the top level keys inside your statements.

### Usage

```graphql
{
    MATCH {
        posts @node(label: Post)
        user @node(label: User)
    }
    MATCH {
        video @node(label: Post)
    }
    RETURN {
        posts
        user
        video
        audio # ⚠ INVALID
    }
}
```
