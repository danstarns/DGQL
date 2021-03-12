import { Driver } from "neo4j-driver";
import { generate } from "randomstring";
import neo4j from "./neo4j";
import { Client } from "../../src";

describe("match", () => {
    let driver: Driver;

    beforeAll(async () => {
        driver = await neo4j();
    });

    afterAll(async () => {
        await driver.close();
    });

    test("should find node with equal using variable", async () => {
        const session = driver.session();

        const client = new Client({ driver });

        const label = generate({
            charset: "alphabetic",
        });
        const id = generate({
            charset: "alphabetic",
        });

        const query = `
            {
                MATCH {
                    test @node(label: "${label}") {
                        WHERE {
                            id(equal: $id)
                        }
                        PROJECT {
                            id
                        }
                    }
                }
                RETURN {
                    test
                }
            }
        `;

        try {
            await session.run(
                `
                    CREATE (:${label} {id: $id})
                    CREATE (:${label} {id: randomUUID()})
                    CREATE (:${label} {id: randomUUID()})
                    CREATE (:${label} {id: randomUUID()})
                `,
                { id }
            );

            const result = await client.run({ query, variables: { id: id } });

            expect(result?.test).toEqual([{ id }]);
        } finally {
            await session.close();
        }
    });

    test("should find node with label using variable", async () => {
        const session = driver.session();

        const client = new Client({ driver });

        const label = generate({
            charset: "alphabetic",
        });
        const id = generate({
            charset: "alphabetic",
        });

        const query = `
            {
                MATCH {
                    test @node(label: $label) {
                        WHERE {
                            id(equal: "${id}")
                        }
                        PROJECT {
                            id
                        }
                    }
                }
                RETURN {
                    test
                }
            }
        `;

        try {
            await session.run(
                `
                    CREATE (:${label} {id: $id})
                    CREATE (:${label} {id: randomUUID()})
                    CREATE (:${label} {id: randomUUID()})
                    CREATE (:${label} {id: randomUUID()})
                `,
                { id }
            );

            const result = await client.run({ query, variables: { label } });

            expect(result?.test).toEqual([{ id }]);
        } finally {
            await session.close();
        }
    });
});
