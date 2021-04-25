import { parse, print } from "graphql";
import { validate } from "../../../src/validate";
import trimmer from "../utils/trimmer";

describe("validate", () => {
  test("should be a function", () => {
    expect(validate).toBeInstanceOf(Function);
  });

  test("abc", () => {
    const doc = parse(`
        {
            MATCH
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

  describe("filter @skip and @limit", () => {
    test("should throw cannot @skip and @include at the same time", () => {
      const doc = parse(`
          {
            MATCH @include(if: true) @skip(if: true)
          }
        `);

      expect(() =>
        validate({
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
        validate({
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
        validate({
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

      const { document, variables } = validate({
        document: doc,
        variables: { truthy: true, falsy: false },
      });

      expect(print(document)).toEqual(
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

      const { document, variables } = validate({
        document: doc,
        variables: { truthy: true, falsy: false },
      });

      expect(print(document)).toEqual(
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
});
