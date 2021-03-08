import { Driver } from "neo4j-driver";
import { generate } from "randomstring";
import neo4j from "./neo4j";
import { Client } from "../../src";

describe("sort", () => {
    let driver: Driver;

    beforeAll(async () => {
        driver = await neo4j();
    });

    afterAll(async () => {
        await driver.close();
    });

    test("should sort nodes", async () => {
        await Promise.all(
            ["ASC", "DESC"].map(async (direction) => {
                const session = driver.session();

                const client = new Client({ driver });

                const id = generate({
                    charset: "alphabetic",
                });

                const query = `
                        {
                            MATCH {
                                test @node(label: "${id}") {
                                    SORT {
                                        dt(direction: ${direction})
                                    }
                                    RETURN {
                                        id
                                        dt
                                    }
                                }
                            }
                        }
                    `;

                const dt1 = new Date().toISOString();
                const dt2 = new Date().toISOString();
                const dt3 = new Date().toISOString();

                try {
                    await session.run(
                        `
                            CREATE (:${id} {id: $id, dt: datetime($dt1)})
                            CREATE (:${id} {id: $id, dt: datetime($dt2)})
                            CREATE (:${id} {id: $id, dt: datetime($dt3)})
                        `,
                        { id, dt1, dt2, dt3 }
                    );

                    const result = await client.run({ query });

                    const tests = result?.MATCH.test as any[];

                    if (direction === "ASC") {
                        expect(tests[0].dt).toEqual(dt1);
                        expect(tests[1].dt).toEqual(dt2);
                        expect(tests[2].dt).toEqual(dt3);
                    } else {
                        expect(tests[0].dt).toEqual(dt3);
                        expect(tests[1].dt).toEqual(dt2);
                        expect(tests[2].dt).toEqual(dt1);
                    }
                } finally {
                    await session.close();
                }
            })
        );
    });

    test("should nested sort nodes", async () => {
        await Promise.all(
            ["ASC", "DESC"].map(async (direction) => {
                const session = driver.session();

                const client = new Client({ driver });

                const label1 = generate({
                    charset: "alphabetic",
                });
                const relType = generate({
                    charset: "alphabetic",
                });
                const label2 = generate({
                    charset: "alphabetic",
                });

                const query = `
                        {
                            MATCH {
                                test @node(label: "${label1}") {
                                    RETURN {
                                        nodes @edge(type: "${relType}", direction: OUT) {
                                            node @node(label: "${label2}") {
                                                SORT {
                                                    dt(direction: ${direction})
                                                }
                                                RETURN {
                                                    id
                                                    dt
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    `;

                const dt1 = new Date().toISOString();
                const dt2 = new Date().toISOString();
                const dt3 = new Date().toISOString();

                try {
                    await session.run(
                        `
                            CREATE (test:${label1} {id: randomUUID()})
                            MERGE (test)-[:${relType}]->(:${label2} {id: randomUUID(), dt: datetime($dt1)})
                            MERGE (test)-[:${relType}]->(:${label2} {id: randomUUID(), dt: datetime($dt2)})
                            MERGE (test)-[:${relType}]->(:${label2} {id: randomUUID(), dt: datetime($dt3)})
                        `,
                        { dt1, dt2, dt3 }
                    );

                    const result = await client.run({ query });

                    const nodes = (result?.MATCH.test as any[])[0].nodes;

                    if (direction === "ASC") {
                        expect(nodes[0].node.dt).toEqual(dt1);
                        expect(nodes[1].node.dt).toEqual(dt2);
                        expect(nodes[2].node.dt).toEqual(dt3);
                    } else {
                        expect(nodes[0].node.dt).toEqual(dt3);
                        expect(nodes[1].node.dt).toEqual(dt2);
                        expect(nodes[2].node.dt).toEqual(dt1);
                    }
                } finally {
                    await session.close();
                }
            })
        );
    });
});
