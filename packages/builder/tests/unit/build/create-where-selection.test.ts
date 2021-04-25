import { createWhereSelectionAndParams } from "../../../src/build";

describe("createWhereSelectionAndParams", () => {
  test("should be function", () => {
    expect(createWhereSelectionAndParams).toBeInstanceOf(Function);
  });
});
