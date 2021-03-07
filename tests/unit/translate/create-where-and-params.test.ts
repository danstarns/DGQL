import createWhereAndParams from "../../../src/translate/create-where-and-params";

describe("createWhereAndParams", () => {
    test("should be a function", () => {
        expect(createWhereAndParams).toBeInstanceOf(Function);
    });
});
