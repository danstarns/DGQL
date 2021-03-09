# @dgql/client

Translation engine and client for the [DGQL Language](https://github.com/danstarns/dgql).

## Getting Started

```
$ npm install @dgql/client
```

⚠ Library not yet published

## Quick Start

```js
const { Client } = require("@dgql/client");
const neo4j = require("neo4j-driver");

const driver = neo4j.driver(
    "bolt://localhost:7687",
    neo4j.auth.basic("neo4j", "password")
);

const client = new Client({ driver });

async function main() {
    const query = `
        {
            MATCH {
                user @node(label: User) {
                    WHERE {
                        name(equal: "Dan")
                    }
                    RETURN {
                        name
                        posts @edge(type: HAS_POST, direction: OUT) {
                            post @node(label: Post) {
                                RETURN {
                                    title
                                }
                            }
                        }
                    }
                }
            }
        }
    `;

    const { MATCH } = await client.run({ query });

    console.log(MATCH.user);
    /*
        [{
            name: "Dan",
            posts: [
                {
                    post: {
                        title: "Checkout @dgql/client"
                    }
                }
            ]
        }]
    */
}

main();
```
