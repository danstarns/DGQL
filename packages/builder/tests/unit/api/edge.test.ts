import Edge from "../../../src/classes/Edge";
import edge from "../../../src/api/edge";

describe("edge", () => {
    test("should return an instance of Edge", () => {
        const e = edge({ direction: "IN", type: "HAS_NODE" });

        expect(e).toBeInstanceOf(Edge);
    });
});
