import { build } from "../../../src/build";

describe("build", () => {
  test("should be function", () => {
    expect(build).toBeInstanceOf(Function);
  });
});
