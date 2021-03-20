import Property from "../../../src/classes/Property";

describe("Property", () => {
    test("should construct", () => {
        // @ts-ignore
        expect(new Property()).toBeInstanceOf(Property);
    });
});
