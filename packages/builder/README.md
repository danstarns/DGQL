# @dgql/builder

<a href="https://badge.fury.io/js/%40dgql%2Fbuilder">
  <img alt="npm package" src="https://badge.fury.io/js/%40dgql%2Fbuilder.svg">
</a>

DGQL Query Builder.

## Getting Started

```
$ npm install @dgql/builder
```

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

## Licence

MIT
