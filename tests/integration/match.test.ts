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

        const selectionSet = `
            {
                match {
                    test @node(label: "${id}") {
                        id
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

            const result = await client.run({ selectionSet });

            expect(result?.match?.test).toEqual([{ id }]);
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

        const selectionSet = `
            {
                match {
                    test1 @node(label: "${id1}") {
                        id
                    }
                    test2 @node(label: "${id2}") {
                        id
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

            const result = await client.run({ selectionSet });

            expect(result?.match?.test1).toEqual([{ id: id1 }]);
            expect(result?.match?.test2).toEqual([{ id: id2 }]);
        } finally {
            await session.close();
        }
    });
});
