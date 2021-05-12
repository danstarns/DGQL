import { parse, printError } from "graphql";
import { validateCypherDirective } from "../../../src/validate";
import trimmer from "../utils/trimmer";

describe("validateCypherDirective", () => {
  describe("@cypher", () => {
    test("should throw @cypher requires arguments statement and or arguments", () => {
      const doc = parse(`
        {
            MATCH {
              custom @cypher
            }
        }
      `);

      try {
        validateCypherDirective({
          directive:
            // @ts-ignore
            doc.definitions[0]?.selectionSet?.selections[0]?.selectionSet
              ?.selections[0]?.directives[0],
          path: undefined,
          variables: {},
        });

        throw new Error();
      } catch (error) {
        expect(trimmer(printError(error))).toEqual(
          trimmer(`
          Unexpected error value: "@cypher requires arguments statement and or arguments"

          GraphQL request:4:22
          3 |                 MATCH {
          4 |                   custom @cypher
            |                   ^
          5 |                 }
        `)
        );
      }
    });

    describe("Statement", () => {
      test("should throw @cypher requires argument statement", async () => {
        const doc = parse(`
            {
                MATCH {
                  custom @cypher(arguments: {abc: "123"})
                }
            }
        `);

        try {
          validateCypherDirective({
            directive:
              // @ts-ignore
              doc.definitions[0]?.selectionSet?.selections[0]?.selectionSet
                ?.selections[0]?.directives[0],
            path: undefined,
            variables: {},
          });

          throw new Error();
        } catch (error) {
          expect(trimmer(printError(error))).toEqual(
            trimmer(`
                Unexpected error value: "@cypher requires argument statement"

                GraphQL request:4:26
                3 |                 MATCH {
                4 |                   custom @cypher(arguments: {abc: \"123\"})
                  |                   ^
                5 |                 }
            `)
          );
        }
      });

      test("should throw @cypher statement must be of StringValue or Argument", () => {
        const doc = parse(`
            {
                MATCH {
                  custom @cypher(statement: 123)
                }
            }
        `);

        try {
          validateCypherDirective({
            directive:
              // @ts-ignore
              doc.definitions[0]?.selectionSet?.selections[0]?.selectionSet
                ?.selections[0]?.directives[0],
            path: undefined,
            variables: {},
          });

          throw new Error();
        } catch (error) {
          expect(trimmer(printError(error))).toEqual(
            trimmer(`
            Unexpected error value: "@cypher statement must be of type StringValue or Argument"

            GraphQL request:4:26
            3 |                 MATCH {
            4 |                   custom @cypher(statement: 123)
              |                   ^
            5 |                 }
        `)
          );
        }
      });

      test("should throw @cypher statement must be of type string", () => {
        const doc = parse(`
            {
                MATCH {
                  custom @cypher(statement: $var)
                }
            }
        `);

        try {
          validateCypherDirective({
            directive:
              // @ts-ignore
              doc.definitions[0]?.selectionSet?.selections[0]?.selectionSet
                ?.selections[0]?.directives[0],
            path: undefined,
            variables: {
              var: 123,
            },
          });

          throw new Error();
        } catch (error) {
          expect(trimmer(printError(error))).toEqual(
            trimmer(`
                Unexpected error value: "@cypher statement must be of type string"

                GraphQL request:4:26
                3 |                 MATCH {
                4 |                   custom @cypher(statement: $var)
                  |                   ^
                5 |                 }
            `)
          );
        }
      });
    });

    describe("Arguments", () => {
      test("should throw @cypher arguments must be of type ObjectValue or Argument (with literal)", async () => {
        const doc = parse(`
            {
                MATCH {
                  custom @cypher(statement: "str", arguments: 123)
                }
            }
        `);

        try {
          validateCypherDirective({
            directive:
              // @ts-ignore
              doc.definitions[0]?.selectionSet?.selections[0]?.selectionSet
                ?.selections[0]?.directives[0],
            path: undefined,
            variables: {
              var: 123,
            },
          });

          throw new Error();
        } catch (error) {
          expect(trimmer(printError(error))).toEqual(
            trimmer(`
            Unexpected error value: "@cypher arguments must be of type ObjectValue or Variable"

            GraphQL request:4:26
            3 |                 MATCH {
            4 |                   custom @cypher(statement: \"str\", arguments: 123)
              |                   ^
            5 |                 }
        `)
          );
        }
      });
    });

    test("should throw invalid argument abc", async () => {
      const doc = parse(`
            {
                MATCH {
                  custom @cypher(statement: "str", arguments: $var, invalid: 123)
                }
            }
        `);

      try {
        validateCypherDirective({
          directive:
            // @ts-ignore
            doc.definitions[0]?.selectionSet?.selections[0]?.selectionSet
              ?.selections[0]?.directives[0],
          path: undefined,
          variables: {
            var: {},
          },
        });

        throw new Error();
      } catch (error) {
        expect(trimmer(printError(error))).toEqual(
          trimmer(`
            Unexpected error value: "@cypher invalid argument(s) invalid"

            GraphQL request:4:26
            3 |                 MATCH {
            4 |                   custom @cypher(statement: \"str\", arguments: $var, invalid: 123)
              |                   ^
            5 |                 }
        `)
        );
      }
    });
  });
});
