import Node from "../../../src/classes/Node";

describe("Node", () => {
    test("should construct", () => {
        // @ts-ignore
        expect(new Node()).toBeInstanceOf(Node);
    });
});
