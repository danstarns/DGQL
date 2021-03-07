import { int } from "neo4j-driver";
// @ts-ignore
import {
    Date as Neo4jDate,
    DateTime as Neo4jDateTime,
    // @ts-ignore
} from "neo4j-driver/lib/temporal-types";
import deserialize from "../../../src/utils/deserialize";

describe("deserialize", () => {
    test("should deserialize neo4j object to normal object", () => {
        const obj = {
            number: { int: int(1) },
        };

        const result = deserialize(obj);

        expect(result).toMatchObject({ number: { int: 1 } });
    });

    test("should deserialize nested neo4j object to normal object", () => {
        const obj = {
            number: {
                int: int(1),
                nestedNumber: [{ number: [{ number: { int: int(10) } }] }],
            },
        };

        const result = deserialize(obj);

        expect(result).toMatchObject({
            number: {
                int: 1,
                nestedNumber: [{ number: [{ number: { int: 10 } }] }],
            },
        });
    });

    test("should deserialize neo4j date into iso string", () => {
        const base = new Date();

        base.setHours(0, 0, 0, 0);

        const obj = {
            date: Neo4jDate.fromStandardDate(base),
        };

        const result = deserialize(obj);

        expect(result).toMatchObject({
            date: base.toISOString(),
        });
    });

    test("should deserialize neo4j datetime into iso string", () => {
        const base = new Date();

        const obj = {
            date: Neo4jDateTime.fromStandardDate(base),
        };

        const result = deserialize(obj);

        expect(result).toMatchObject({
            date: base.toISOString(),
        });
    });
});
