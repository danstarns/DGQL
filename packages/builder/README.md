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

const [dgql, params] = builder
    .match({
        user: node({ label: "User" })
            .where({ name: "Dan" })
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
