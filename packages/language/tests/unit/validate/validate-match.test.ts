import { FieldNode, parse, printError } from "graphql";
import { validateMatch } from "../../../src/validate";
import trimmer from "../utils/trimmer";

describe("validateMatch", () => {
  test("should throw MATCH requires a selection", () => {
    const doc = parse(`
      {
         MATCH
      }
    `);

    try {
      validateMatch({
        node: ((doc.definitions[0] as unknown) as FieldNode).selectionSet
          ?.selections[0] as FieldNode,
        variables: {},
      });
    } catch (error) {
      expect(trimmer(printError(error))).toEqual(
        trimmer(`
        Unexpected error value: "MATCH requires a selection"

        GraphQL request:3:10
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
        validateMatch({
          node: ((doc.definitions[0] as unknown) as FieldNode).selectionSet
            ?.selections[0] as FieldNode,
          variables: {},
        });
      } catch (error) {
        if (type === "arguments") {
          expect(trimmer(printError(error))).toEqual(
            trimmer(`
            Unexpected error value: "${type} not allowed on MATCH"

            GraphQL request:3:14
            2 |             {
            3 |                MATCH(arguments: 123) {
              |                ^
            4 |                  node @node
        `)
          );
        } else {
          expect(trimmer(printError(error))).toEqual(
            trimmer(`
            Unexpected error value: "${type} not allowed on MATCH"

            GraphQL request:3:16
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
