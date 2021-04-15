import { filterDocumentWithConditionalSelection } from "../../../src/utils";
import { parse, print } from "graphql";

describe("filterDocumentWithConditionalSelection", () => {
  test("should be a function", () => {
    expect(filterDocumentWithConditionalSelection).toBeInstanceOf(Function);
  });

  test("should throw cannot @skip and @include at the same time", () => {
    const doc = parse(`
      {
        MATCH @include(if: true) @skip(if: true)
      }
    `);

    expect(() =>
      filterDocumentWithConditionalSelection({
        document: doc,
        variables: { truthy: true, falsy: false },
      })
    ).toThrow("cannot @skip and @include at the same time");
  });

  test("should throw directive argument: @include(if: ) required", () => {
    const doc = parse(`
      {
        MATCH @include
      }
    `);

    expect(() =>
      filterDocumentWithConditionalSelection({
        document: doc,
        variables: { truthy: true, falsy: false },
      })
    ).toThrow("directive argument: @include(if: ) required");
  });

  test("should throw directive argument: @skip(if: ) required", () => {
    const doc = parse(`
      {
        MATCH @skip
      }
    `);

    expect(() =>
      filterDocumentWithConditionalSelection({
        document: doc,
        variables: { truthy: true, falsy: false },
      })
    ).toThrow("directive argument: @skip(if: ) required");
  });

  test("should remove all @include where applicable", () => {
    const doc = parse(`
      {
        MATCH @include(if: $truthy)
        MATCH @include(if: $falsy)
        MATCH @include(if: true)
        MATCH @include(if: false)
        MATCH {
          MATCH
        }
        MATCH {
          MATCH @include(if: $truthy)
          MATCH @include(if: $falsy)
          MATCH @include(if: true)
          MATCH @include(if: false)
          MATCH {
            MATCH
          }
        }
      }
    `);

    const parsedDoc = filterDocumentWithConditionalSelection({
      document: doc,
      variables: { truthy: true, falsy: false },
    });

    expect(print(parsedDoc)).toEqual(
      print(
        parse(`
          {
            MATCH
            MATCH
            MATCH {
              MATCH
            }
            MATCH {
              MATCH
              MATCH
              MATCH {
                MATCH
              }
            }
          }
        `)
      )
    );
  });

  test("should remove all @skip where applicable", () => {
    const doc = parse(`
      {
        MATCH @skip(if: $truthy)
        MATCH @skip(if: $falsy)
        MATCH @skip(if: true)
        MATCH @skip(if: false)
        MATCH {
          MATCH
        }
        MATCH {
          MATCH @skip(if: $truthy)
          MATCH @skip(if: $falsy)
          MATCH @skip(if: true)
          MATCH @skip(if: false)
          MATCH {
            MATCH
          }
        }
      }
    `);

    const parsedDoc = filterDocumentWithConditionalSelection({
      document: doc,
      variables: { truthy: true, falsy: false },
    });

    expect(print(parsedDoc)).toEqual(
      print(
        parse(`
          {
            MATCH
            MATCH
            MATCH {
              MATCH
            }
            MATCH {
              MATCH
              MATCH
              MATCH {
                MATCH
              }
            }
          }
        `)
      )
    );
  });
});
