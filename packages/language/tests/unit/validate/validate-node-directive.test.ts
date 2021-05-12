import { parse, printError } from "graphql";
import { validateNodeDirective } from "../../../src/validate";
import trimmer from "../utils/trimmer";

describe("validateNodeDirective", () => {
  test("should throw @node label must be of type StringValue or Argument or EnumValue", () => {
    const doc = parse(`
        {
            node @node(label: 123)
        }
      `);

    try {
      validateNodeDirective({
        directive:
          // @ts-ignore
          doc.definitions[0]?.selectionSet?.selections[0]?.directives[0],
        path: undefined,
        variables: {},
      });

      throw new Error();
    } catch (error) {
      expect(trimmer(printError(error))).toEqual(
        trimmer(`
          Unexpected error value: "@node label must be of type StringValue or Argument or EnumValue"

          GraphQL request:3:18
          2 |         {
          3 |             node @node(label: 123)
            |                  ^
          4 |         }
        `)
      );
    }
  });

  test("should throw @node label must be of type string", () => {
    const doc = parse(`
        {
            node @node(label: $var)
        }
      `);

    try {
      validateNodeDirective({
        directive:
          // @ts-ignore
          doc.definitions[0]?.selectionSet?.selections[0]?.directives[0],
        path: undefined,
        variables: {
          var: 122,
        },
      });

      throw new Error();
    } catch (error) {
      expect(trimmer(printError(error))).toEqual(
        trimmer(`
          Unexpected error value: "@node label must be of type string"

          GraphQL request:3:18
          2 |         {
          3 |             node @node(label: $var)
            |                  ^
          4 |         }
        `)
      );
    }
  });
});
