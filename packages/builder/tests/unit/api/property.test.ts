import Property from "../../../src/classes/Property";
import property from "../../../src/api/property";

describe("property", () => {
    test("should return an instance of Property", () => {
        const p = property();

        expect(p).toBeInstanceOf(Property);
    });
});
