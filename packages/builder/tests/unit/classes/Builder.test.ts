import Builder from "../../../src/classes/Builder";
import Node from "../../../src/classes/Node";

describe("Builder", () => {
    test("should construct", () => {
        expect(new Builder()).toBeInstanceOf(Builder);
    });

    describe("methods", () => {
        describe("match", () => {
            test("should have method", () => {
                const builder = new Builder();

                expect(builder.match).toBeInstanceOf(Function);
            });
        });

        describe("return", () => {
            test("should have method", () => {
                const builder = new Builder();

                expect(builder.return).toBeInstanceOf(Function);
            });
        });

        describe("build", () => {
            test("should have method", () => {
                const builder = new Builder();

                expect(builder.build).toBeInstanceOf(Function);
            });
        });
    });
});
