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

    test("should find nodes", async () => {
        const session = driver.session();

        const client = new Client({ driver });

        const id = generate({
            charset: "alphabetic",
        });

        const query = `
            {
                MATCH {
                    test @node(label: "${id}") {
                        RETURN {
                            id
                        }
                    }
                }
            }
        `;

        try {
            await session.run(
                `
                CREATE (:${id} {id: $id})
            `,
                { id }
            );

            const result = await client.run({ query });

            expect(result?.MATCH?.test).toEqual([{ id }]);
        } finally {
            await session.close();
        }
    });

    test("should preform many matches", async () => {
        const session = driver.session();

        const client = new Client({ driver });

        const id1 = generate({
            charset: "alphabetic",
        });

        const id2 = generate({
            charset: "alphabetic",
        });

        const query = `
            {
                MATCH {
                    test1 @node(label: "${id1}") {
                        RETURN {
                            id
                        }
                    }
                    test2 @node(label: "${id2}") {
                        RETURN {
                            id
                        }
                    }
                }
            }
        `;

        try {
            await session.run(
                `
                CREATE (:${id1} {id: $id1}), (:${id2} {id: $id2})
            `,
                { id1, id2 }
            );

            const result = await client.run({ query });

            expect(result?.MATCH?.test1).toEqual([{ id: id1 }]);
            expect(result?.MATCH?.test2).toEqual([{ id: id2 }]);
        } finally {
            await session.close();
        }
    });

    test("should match and project nested node", async () => {
        const session = driver.session();

        const client = new Client({ driver });

        const id1 = generate({
            charset: "alphabetic",
        });

        const id2 = generate({
            charset: "alphabetic",
        });

        const type = generate({
            charset: "alphabetic",
        });

        const direction = "OUT";

        const query = `
            {
                MATCH {
                    test1 @node(label: "${id1}") {
                        RETURN {
                            id
                            nodes @edge(type: "${type}", direction: "${direction}") {
                                test2 @node(label: "${id2}") {
                                    RETURN {
                                        id
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `;

        try {
            await session.run(
                `
                CREATE (:${id1} {id: $id1})-[:${type}]->(:${id2} {id: $id2})
            `,
                { id1, id2 }
            );

            const result = await client.run({ query });

            expect(result?.MATCH?.test1).toEqual([
                { id: id1, nodes: [{ test2: { id: id2 } }] },
            ]);
        } finally {
            await session.close();
        }
    });

    test("should match and project nested relationship property", async () => {
        const session = driver.session();

        const client = new Client({ driver });

        const id1 = generate({
            charset: "alphabetic",
        });

        const id2 = generate({
            charset: "alphabetic",
        });

        const type = generate({
            charset: "alphabetic",
        });

        const direction = "OUT";

        const query = `
            {
                MATCH {
                    test1 @node(label: "${id1}") {
                        RETURN {
                            id
                            nodes @edge(type: "${type}", direction: "${direction}") {
                                test2 @node(label: "${id2}")
                                properties @relationship {
                                    RETURN {
                                        id
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `;

        try {
            await session.run(
                `
                CREATE (:${id1} {id: $id1})-[:${type} {id: $id2}]->(:${id2})
            `,
                { id1, id2 }
            );

            const result = await client.run({ query });

            expect(result?.MATCH?.test1).toEqual([
                { id: id1, nodes: [{ properties: { id: id2 } }] },
            ]);
        } finally {
            await session.close();
        }
    });

    test("should match and project nested node and relationship property", async () => {
        const session = driver.session();

        const client = new Client({ driver });

        const id1 = generate({
            charset: "alphabetic",
        });

        const id2 = generate({
            charset: "alphabetic",
        });

        const type = generate({
            charset: "alphabetic",
        });

        const direction = "OUT";

        const query = `
            {
                MATCH {
                    test1 @node(label: "${id1}") {
                        RETURN {
                            id
                            nodes @edge(type: "${type}", direction: "${direction}") {
                                node @node(label: "${id2}") {
                                    RETURN {
                                        id
                                    }
                                }
                                properties @relationship {
                                    RETURN {
                                        id
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `;

        try {
            await session.run(
                `
                CREATE (:${id1} {id: $id1})-[:${type} {id: $id2}]->(:${id2} {id: $id2})
            `,
                { id1, id2 }
            );

            const result = await client.run({ query });

            expect(result?.MATCH?.test1).toEqual([
                {
                    id: id1,
                    nodes: [{ node: { id: id2 }, properties: { id: id2 } }],
                },
            ]);
        } finally {
            await session.close();
        }
    });
});
