import Node from "../../../src/classes/Node";
import node from "../../../src/api/node";

describe("node", () => {
    test("should return an instance of Node", () => {
        const p = node();

        expect(p).toBeInstanceOf(Node);
    });
});
