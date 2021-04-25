import { filterDocumentWithConditionalSelection } from "../../../src/validate";
import { parse, print, printError } from "graphql";
import trimmer from "../utils/trimmer";

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

    try {
      filterDocumentWithConditionalSelection({
        document: doc,
        variables: { truthy: true, falsy: false },
      });
    } catch (error) {
      expect(trimmer(printError(error))).toEqual(
        trimmer(`
        Unexpected error value: "cannot @skip and @include at the same time"

        GraphQL request:3:15
        2 |       {
        3 |         MATCH @include(if: true) @skip(if: true)
          |               ^
        4 |       }
      `)
      );
    }
  });

  test("should throw directive argument: @include(if: ) required", () => {
    const doc = parse(`
      {
        MATCH @include
      }
    `);

    try {
      filterDocumentWithConditionalSelection({
        document: doc,
        variables: { truthy: true, falsy: false },
      });
    } catch (error) {
      expect(trimmer(printError(error))).toEqual(
        trimmer(`
          Unexpected error value: "directive argument: @include(if: ) required"
        
          GraphQL request:3:15
          2 |       {
          3 |         MATCH @include
            |               ^
          4 |       }
      `)
      );
    }
  });

  test("should throw directive argument: @skip(if: ) required", () => {
    const doc = parse(`
      {
        MATCH @skip
      }
    `);

    try {
      filterDocumentWithConditionalSelection({
        document: doc,
        variables: { truthy: true, falsy: false },
      });
    } catch (error) {
      expect(trimmer(printError(error))).toEqual(
        trimmer(`
          Unexpected error value: "directive argument: @skip(if: ) required"

          GraphQL request:3:15
          2 |       {
          3 |         MATCH @skip
            |               ^
          4 |       }
      `)
      );
    }
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
