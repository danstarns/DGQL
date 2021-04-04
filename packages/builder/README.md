# @dgql/builder

DGQL Query Builder.

## Getting Started

```
$ npm install @dgql/builder
```

⚠ Library not yet published

## Quick Start

```js
const { Builder, node, property, edge } = require("@dgql/builder");

const builder = new Builder();

const [dgql, variables] = builder
  .match({
    user: node({ label: "User" })
      .where({ name: property({ equal: "Dan" }) })
      .project({
        id: property(),
        name: property(),
        posts: edge({
          type: "HAS_POST",
          direction: "OUT",
          node: node({ label: "Post" }),
        }).project({
          title: property(),
        }),
      }),
  })
  .return(["user"])
  .build();

console.log(dgql);
/*
    {
        MATCH {
            user @node(label: User) {
                WHERE {
                    name(equal: "Dan")
                }
                PROJECT {
                    id
                    name
                    posts @edge(type: HAS_POST, direction: OUT) @node(label: Post) {
                        title
                    }
                }
            }
        }
        RETURN {
            user
        }
    }
*/
```

## Usage

> For the best view browse the [TCK tests](./tests/tck)

### Recipes

Showing how to create each Query from [DGQL Recipes](https://github.com/danstarns/DGQL/tree/main/misc/recipes) using the Builder.

#### Match Blog

https://github.com/danstarns/DGQL/blob/main/misc/recipes/match-blog.gql

```js
import { Builder, node, property, edge } from "@dgql/builder";

const builder = new Builder();

const [dgql, variables] = builder
  .match({
    blog: node({ label: "Blog" }).project({
      name: property(),
      posts: edge({
        type: "HAS_POST",
        direction: "OUT",
        node: node({ label: "Post" }),
      }).project({
        title: property(),
        comments: edge({
          type: "HAS_COMMENT",
          direction: "OUT",
          node: node({ label: "Comment" }),
        }).project({
          content: property(),
          authors: edge({
            type: "COMMENTED",
            direction: "IN",
            node: node({ label: "User" }),
          }).project({
            name: property(),
          }),
        }),
      }),
    }),
  })
  .return(["blog"])
  .build();
```

#### Match Blog (TODO REL PROPERTIES USING BUILDER)

https://github.com/danstarns/DGQL/blob/main/misc/recipes/match-movies.gql

#### Match Pringles

https://github.com/danstarns/DGQL/blob/main/misc/recipes/match-pringles.gql

```js
import { Builder, node, property, edge } from "@dgql/builder";

const builder = new Builder();

const [dgql, variables] = builder
  .match({
    product: node({ label: "Product" }).project({
      name: property(),
      sizes: edge({
        type: "HAS_SIZE",
        direction: "OUT",
        node: node({ label: "Size" }),
      }).project({
        name: property(),
      }),
      photos: edge({
        type: "HAS_PHOTO",
        direction: "OUT",
        node: node({ label: "Photo" }),
      }).project({
        url: property(),
        description: property(),
        color: edge({
          type: "OF_COLOR",
          direction: "OUT",
          node: node({ label: "Color" }),
        }).project({ name: property() }),
      }),
    }),
  })
  .return(["product"])
  .build();
```

#### Match User Comments (TODO EDGE WHERE USING BUILDER)

https://github.com/danstarns/DGQL/blob/main/misc/recipes/match-user-comments.gql

#### Match User Content (TODO MULTI NODE EDGE USING BUILDER)

https://github.com/danstarns/DGQL/blob/main/misc/recipes/match-user-content.gql

#### Match With Cypher (TODO @cypher USING BUILDER)

https://github.com/danstarns/DGQL/blob/main/misc/recipes/match-with-cypher.gql
