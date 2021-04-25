import { createWhereDirectiveAndParams } from "../../../src/build";

describe("createWhereDirectiveAndParams", () => {
  test("should be function", () => {
    expect(createWhereDirectiveAndParams).toBeInstanceOf(Function);
  });
});
