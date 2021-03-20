import Builder from "../../../src/classes/Builder";

describe("Builder", () => {
    test("should construct", () => {
        expect(new Builder()).toBeInstanceOf(Builder);
    });
});
