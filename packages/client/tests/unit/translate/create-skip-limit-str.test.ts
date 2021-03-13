import { createSkipLimitStr } from "../../../src/translate";

describe("createSkipLimitStr", () => {
    test("should be a function", () => {
        expect(createSkipLimitStr).toBeInstanceOf(Function);
    });
});
