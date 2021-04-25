import { parse, print } from "graphql";
import { validate } from "../../../src/validate";
import trimmer from "../utils/trimmer";

describe("ABBA", () => {
  test("should be a function", () => {
    expect(validate).toBeInstanceOf(Function);
  });

  test("abc", () => {
    const doc = parse(`
        {
            MATCH {
              node @node
            }
        }
    `);

    validate({ document: doc, variables: {} });
  });

  test("should throw fields are only supported here", () => {
    const doc = parse(`
        {
            ... on Test {
                test
            }
        }
    `);

    try {
      validate({ document: doc, variables: {}, shouldPrintError: true });
    } catch (error) {
      expect(trimmer(error.message)).toEqual(
        trimmer(`
            Unexpected error value: "Fields are only supported here"

            GraphQL request:3:13
            2 |         {
            3 |             ... on Test {
              |             ^
            4 |                 test
        `)
      );
    }
  });

  test("should throw Invalid operation", () => {
    const validSelections = ["MATCH", "CREATE", "UPDATE", "DELETE", "RETURN"];

    const doc = parse(`
        {
           INVALID 
        }
    `);

    try {
      validate({ document: doc, variables: {}, shouldPrintError: true });
    } catch (error) {
      expect(trimmer(error.message)).toEqual(
        trimmer(`
            Unexpected error value: "Invalid operation: INVALID. Use one of ${validSelections.join(
              ", "
            )}"

            GraphQL request:3:12
            2 |         {
            3 |             INVALID
              |             ^
            4 |         }
        `)
      );
    }
  });

  test("should throw can only RETURN once top-level", () => {
    const doc = parse(`
        {
           RETURN {
             name
           }
           RETURN {
             name
           } 
        }
    `);

    try {
      validate({ document: doc, variables: {}, shouldPrintError: true });
    } catch (error) {
      expect(trimmer(error.message)).toEqual(
        trimmer(`
            Unexpected error value: "Found a second RETURN when only one allowed"

            GraphQL request:6:12
            5 |            }
            6 |            RETURN {
              |            ^
            7 |              name
        `)
      );
    }
  });

  describe("validateMatch", () => {
    test("should throw MATCH requires a selection", () => {
      const doc = parse(`
        {
           MATCH
        }
      `);

      try {
        validate({ document: doc, variables: {}, shouldPrintError: true });
      } catch (error) {
        expect(trimmer(error.message)).toEqual(
          trimmer(`
          Unexpected error value: "MATCH requires a selection"

          GraphQL request:3:12
          2 |         {
          3 |            MATCH
            |            ^
          4 |         }
      `)
        );
      }
    });

    test("should throw directives|arguments not allowed on MATCH", () => {
      ["arguments", "directives"].forEach((type) => {
        let doc;

        if (type === "directives") {
          doc = parse(`
              {
                 MATCH @directives {
                   node @node
                 }
              }
          `);
        } else {
          doc = parse(`
            {
               MATCH(arguments: 123) {
                 node @node
               }
            }
          `);
        }

        try {
          validate({ document: doc, variables: {}, shouldPrintError: true });
        } catch (error) {
          if (type === "arguments") {
            expect(trimmer(error.message)).toEqual(
              trimmer(`
              Unexpected error value: "${type} not allowed on MATCH"
  
              GraphQL request:3:16
              2 |             {
              3 |                MATCH(arguments: 123) {
                |                ^
              4 |                  node @node
          `)
            );
          } else {
            expect(trimmer(error.message)).toEqual(
              trimmer(`
              Unexpected error value: "${type} not allowed on MATCH"
  
              GraphQL request:3:18
              2 |             {
              3 |                MATCH @directives {
                |                ^
              4 |                  node @node
            `)
            );
          }
        }
      });
    });
  });
});
