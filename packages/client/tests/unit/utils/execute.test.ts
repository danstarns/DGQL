import { execute } from "../../../src/utils";

describe("execute", () => {
    test("should be a function", () => {
        expect(execute).toBeInstanceOf(Function);
    });
});
