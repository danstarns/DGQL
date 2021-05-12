import { parse, printError } from "graphql";
import { validateNodeSelection } from "../../../src/validate";
import trimmer from "../utils/trimmer";

describe("validateNodeSelection", () => {
  test("should throw invalid node selection", () => {
    const doc = parse(`
      {
         MATCH {
             node @node {
                 invalid
             }
         }
      }
    `);

    try {
      validateNodeSelection({
        node:
          // @ts-ignore
          doc.definitions[0].selectionSet?.selections[0].selectionSet
            ?.selections[0],
        variables: {},
        path: undefined,
      });

      throw Error();
    } catch (error) {
      expect(trimmer(printError(error))).toEqual(
        trimmer(`
         Unexpected error value: \"Invalid node selection try one of; PROJECT, WHERE, SORT\"
         GraphQL request:5:18
         4 |              node @node {
         5 |                  invalid
           |                  ^
         6 |              }
    `)
      );
    }
  });

  describe("PROJECT", () => {
    test("should throw only one PROJECT allowed", async () => {
      const doc = parse(`
        {
           MATCH {
               node @node {
                   PROJECT {
                       name
                   }
                   PROJECT {
                       name
                   }
               }
           }
        }
      `);

      try {
        validateNodeSelection({
          node:
            // @ts-ignore
            doc.definitions[0].selectionSet?.selections[0].selectionSet
              ?.selections[0],
          variables: {},
          path: undefined,
        });

        throw Error();
      } catch (error) {
        expect(trimmer(printError(error))).toEqual(
          trimmer(`
          Unexpected error value: "Only one PROJECT allowed"

          GraphQL request:8:20
          7 |                    }
          8 |                    PROJECT {
            |                    ^
          9 |                        name
      `)
        );
      }
    });
  });

  describe("SORT", () => {
    test("should throw only one SORT allowed", async () => {
      const doc = parse(`
        {
           MATCH {
               node @node {
                   SORT {
                       name(direction: ASC)
                   }
                   SORT {
                       name(direction: ASC)
                   }
               }
           }
        }
      `);

      try {
        validateNodeSelection({
          node:
            // @ts-ignore
            doc.definitions[0].selectionSet?.selections[0].selectionSet
              ?.selections[0],
          variables: {},
          path: undefined,
        });

        throw Error();
      } catch (error) {
        expect(trimmer(printError(error))).toEqual(
          trimmer(`
          Unexpected error value: "Only one SORT allowed"

          GraphQL request:8:20
          7 |                    }
          8 |                    SORT {
            |                    ^
          9 |                        name(direction: ASC)
      `)
        );
      }
    });
  });

  describe("WHERE", () => {
    test("should throw only one WHERE allowed", async () => {
      const doc = parse(`
        {
           MATCH {
               node @node {
                   WHERE {
                       name(equal: "Dan")
                   }
                   WHERE {
                       name(equal: "Dan")
                   }
               }
           }
        }
      `);

      try {
        validateNodeSelection({
          node:
            // @ts-ignore
            doc.definitions[0].selectionSet?.selections[0].selectionSet
              ?.selections[0],
          variables: {},
          path: undefined,
        });

        throw Error();
      } catch (error) {
        expect(trimmer(printError(error))).toEqual(
          trimmer(`
          Unexpected error value: "Only one WHERE allowed"

          GraphQL request:8:20
          7 |                    }
          8 |                    WHERE {
            |                    ^
          9 |                        name(equal: "Dan")
      `)
        );
      }
    });
  });
});
