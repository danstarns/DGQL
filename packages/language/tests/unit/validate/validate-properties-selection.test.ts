import { parse, printError } from "graphql";
import { validatePropertiesSelection } from "../../../src/validate";
import trimmer from "../utils/trimmer";

describe("validatePropertiesSelection", () => {
  test("should throw arguments not valid on PROPERTIES", () => {
    const doc = parse(`
      {
         PROPERTIES(arg: 123)
      }
    `);

    try {
      validatePropertiesSelection({
        // @ts-ignore
        propertiesSelection: doc.definitions[0].selectionSet?.selections[0],
        variables: {},
        path: undefined,
      });

      throw Error();
    } catch (error) {
      expect(trimmer(printError(error))).toEqual(
        trimmer(`
          Unexpected error value: "arguments not valid on PROPERTIES"

          GraphQL request:3:10
          2 |       {
          3 |          PROPERTIES(arg: 123)
            |          ^
          4 |       }
    `)
      );
    }
  });

  test("should throw directives not valid on PROPERTIES", () => {
    const doc = parse(`
      {
         PROPERTIES @abc
      }
    `);

    try {
      validatePropertiesSelection({
        // @ts-ignore
        propertiesSelection: doc.definitions[0].selectionSet?.selections[0],
        variables: {},
        path: undefined,
      });

      throw Error();
    } catch (error) {
      expect(trimmer(printError(error))).toEqual(
        trimmer(`
          Unexpected error value: "directives not valid on PROPERTIES"

          GraphQL request:3:10
          2 |       {
          3 |          PROPERTIES @abc
            |          ^
          4 |       }
    `)
      );
    }
  });

  test("should throw PROPERTIES requires a selection", () => {
    const doc = parse(`
      {
         PROPERTIES 
      }
    `);

    try {
      validatePropertiesSelection({
        // @ts-ignore
        propertiesSelection: doc.definitions[0].selectionSet?.selections[0],
        variables: {},
        path: undefined,
      });

      throw Error();
    } catch (error) {
      expect(trimmer(printError(error))).toEqual(
        trimmer(`
        Unexpected error value: "PROPERTIES requires a selection"

        GraphQL request:3:10
        2 |       {
        3 |          PROPERTIES
          |          ^
        4 |       }
    `)
      );
    }
  });

  test("should throw Invalid PROPERTIES selection, try one of PROJECT or WHERE", () => {
    const doc = parse(`
      {
         PROPERTIES {
           abc
         }
      }
    `);

    try {
      validatePropertiesSelection({
        // @ts-ignore
        propertiesSelection: doc.definitions[0].selectionSet?.selections[0],
        variables: {},
        path: undefined,
      });

      throw Error();
    } catch (error) {
      expect(trimmer(printError(error))).toEqual(
        trimmer(`
        Unexpected error value: "Invalid PROPERTIES selection, try one of PROJECT or WHERE"

        GraphQL request:3:10
        2 |       {
        3 |          PROPERTIES {
          |          ^
        4 |            abc
    `)
      );
    }
  });

  test("should throw one of the validateProject errors", () => {
    const doc = parse(`
    {
       PROPERTIES {
         PROJECT {
           abc @edge(type: HAS_NODE)
         }
       }
    }
  `);

    try {
      validatePropertiesSelection({
        // @ts-ignore
        propertiesSelection: doc.definitions[0].selectionSet?.selections[0],
        variables: {},
        path: undefined,
      });

      throw Error();
    } catch (error) {
      expect(trimmer(printError(error))).toEqual(
        trimmer(`
          Unexpected error value: "Cannot edge on relationship properties"

          GraphQL request:5:12
          4 |          PROJECT {
          5 |            abc @edge(type: HAS_NODE)
            |            ^
          6 |          }
      `)
      );
    }
  });
});
