import { createPaginationDirectiveNode } from "../../../src/build";

describe("createPaginationDirectiveNode", () => {
  test("should be function", () => {
    expect(createPaginationDirectiveNode).toBeInstanceOf(Function);
  });
});
