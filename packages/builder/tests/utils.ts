import { parse, print, DocumentNode } from "graphql";

export function expectEqual({
  expected,
  received,
}: {
  expected: DocumentNode;
  received: string;
}): void {
  expect(print(expected)).toEqual(print(parse(received)));
}
