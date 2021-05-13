import { parse, printError } from "graphql";
import { validateWhereSelection } from "../../../src/validate";
import trimmer from "../utils/trimmer";

describe("validateWhereSelection", () => {
  test("should throw WHERE requires no directives", () => {
    const doc = parse(`
      {
         WHERE @abc
      }
    `);

    try {
      validateWhereSelection({
        whereSelection:
          // @ts-ignore
          doc.definitions[0].selectionSet?.selections[0],
        variables: {},
        path: undefined,
        type: "node",
      });

      throw Error();
    } catch (error) {
      expect(trimmer(printError(error))).toEqual(
        trimmer(`
            Unexpected error value: "WHERE requires no directives"

            GraphQL request:3:10
            2 |       {
            3 |          WHERE @abc
              |          ^
            4 |       }
      `)
      );
    }
  });

  test("should throw WHERE requires no arguments", () => {
    const doc = parse(`
      {
         WHERE(abc: 123)
      }
    `);

    try {
      validateWhereSelection({
        whereSelection:
          // @ts-ignore
          doc.definitions[0].selectionSet?.selections[0],
        variables: {},
        path: undefined,
        type: "node",
      });

      throw Error();
    } catch (error) {
      expect(trimmer(printError(error))).toEqual(
        trimmer(`
            Unexpected error value: "WHERE requires no arguments"

            GraphQL request:3:10
            2 |       {
            3 |          WHERE(abc: 123)
              |          ^
            4 |       }
      `)
      );
    }
  });

  test("should throw WHERE requires a selection", () => {
    const doc = parse(`
    {
       WHERE
    }
  `);

    try {
      validateWhereSelection({
        whereSelection:
          // @ts-ignore
          doc.definitions[0].selectionSet?.selections[0],
        variables: {},
        path: undefined,
        type: "node",
      });

      throw Error();
    } catch (error) {
      expect(trimmer(printError(error))).toEqual(
        trimmer(`
            Unexpected error value: "WHERE requires requires a selection"

            GraphQL request:3:8
            2 |     {
            3 |        WHERE
              |        ^
            4 |     }
    `)
      );
    }
  });

  test("should throw field requires operator argument", () => {
    const doc = parse(`
    {
       WHERE {
           name
       }
    }
  `);

    try {
      validateWhereSelection({
        whereSelection:
          // @ts-ignore
          doc.definitions[0].selectionSet?.selections[0],
        variables: {},
        path: undefined,
        type: "node",
      });

      throw Error();
    } catch (error) {
      expect(trimmer(printError(error))).toEqual(
        trimmer(`
            Unexpected error value: "WHERE field requires operator argument"

            GraphQL request:4:12
            3 |        WHERE {
            4 |            name
              |            ^
            5 |        }
        `)
      );
    }
  });

  test("should throw field requires no directives", () => {
    const doc = parse(`
    {
       WHERE {
           name @abc
       }
    }
  `);

    try {
      validateWhereSelection({
        whereSelection:
          // @ts-ignore
          doc.definitions[0].selectionSet?.selections[0],
        variables: {},
        path: undefined,
        type: "node",
      });

      throw Error();
    } catch (error) {
      expect(trimmer(printError(error))).toEqual(
        trimmer(`
            Unexpected error value: "WHERE field requires no directives"

            GraphQL request:4:12
            3 |        WHERE {
            4 |            name @abc
              |            ^
            5 |        }
        `)
      );
    }
  });

  test("should throw invalid operator", () => {
    const doc = parse(`
    {
       WHERE {
           name(invalid: 2)
       }
    }
  `);

    try {
      validateWhereSelection({
        whereSelection:
          // @ts-ignore
          doc.definitions[0].selectionSet?.selections[0],
        variables: {},
        path: undefined,
        type: "node",
      });

      throw Error();
    } catch (error) {
      expect(trimmer(printError(error))).toEqual(
        trimmer(`
            Unexpected error value: "WHERE field invalid operator 'invalid' try one of: equal, in, not, exists, gt, gte, lt, lte, starts_with, ends_with, contains, regex"

            GraphQL request:4:17
            3 |        WHERE {
            4 |            name(invalid: 2)
              |                 ^
            5 |        }
        `)
      );
    }
  });

  describe("When using WHERE on relationship properties", () => {
    test("should throw cannot edge from relationship properties", () => {
      const doc = parse(`
        {
           WHERE {
               EDGE
           }
        }
      `);

      try {
        validateWhereSelection({
          whereSelection:
            // @ts-ignore
            doc.definitions[0].selectionSet?.selections[0],
          variables: {},
          path: undefined,
          type: "relationship",
        });

        throw Error();
      } catch (error) {
        expect(trimmer(printError(error))).toEqual(
          trimmer(`
                Unexpected error value: "Cannot edge WHERE from relationship properties"

                GraphQL request:4:16
                3 |            WHERE {
                4 |                EDGE
                  |                ^
                5 |            }
            `)
        );
      }
    });
  });
});
