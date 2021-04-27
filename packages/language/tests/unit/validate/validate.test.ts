import { parse } from "graphql";
import { validate } from "../../../src/validate";
import trimmer from "../utils/trimmer";

describe("validate", () => {
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

  test("should throw RETURN requires a selection", () => {
    const doc = parse(`
        {
           RETURN 
        }
    `);

    try {
      validate({ document: doc, variables: {}, shouldPrintError: true });
    } catch (error) {
      expect(trimmer(error.message)).toEqual(
        trimmer(`
            Unexpected error value: "RETURN requires a selection"

            GraphQL request:3:12
            2 |         {
            3 |            RETURN
              |            ^
            4 |         }
        `)
      );
    }
  });
});
