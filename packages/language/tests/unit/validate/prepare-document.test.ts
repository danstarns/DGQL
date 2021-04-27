import { prepareDocument } from "../../../src/validate";
import { parse, print, printError } from "graphql";
import trimmer from "../utils/trimmer";

describe("prepareDocument", () => {
  test("should throw cannot @skip and @include at the same time", () => {
    const doc = parse(`
      {
        MATCH @include(if: true) @skip(if: true)
      }
    `);

    try {
      prepareDocument({
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
      prepareDocument({
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
      prepareDocument({
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

    const parsedDoc = prepareDocument({
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

    const parsedDoc = prepareDocument({
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

  describe("Fragments", () => {
    test("should throw fragment not on DGQL", () => {
      const doc = parse(`
        {
         MATCH {
           ...MyFragment
         }
        }
        
        fragment MyFragment on Test {
          node @node
        }
      `);

      try {
        prepareDocument({
          document: doc,
          variables: { truthy: true, falsy: false },
        });
      } catch (error) {
        expect(trimmer(printError(error))).toEqual(
          trimmer(`
            Unexpected error value: "fragment not on DGQL"

            GraphQL request:8:9
            7 |
            8 |         fragment MyFragment on Test {
              |         ^
            9 |           node @node
        `)
        );
      }
    });

    test("should throw fragment not found", () => {
      const doc = parse(`
        {
         MATCH {
           ...NotFound
         }
        }
        
        fragment MyFragment on Test {
          node @node
        }
      `);

      try {
        prepareDocument({
          document: doc,
          variables: { truthy: true, falsy: false },
        });
      } catch (error) {
        expect(trimmer(printError(error))).toEqual(
          trimmer(`
            Unexpected error value: "fragment NotFound not found"

            GraphQL request:4:12
            3 |          MATCH {
            4 |            ...NotFound
              |            ^
            5 |          }
        `)
        );
      }
    });

    test("should apply fragment onto document", () => {
      const doc = parse(`
        {
         MATCH {
           ...MyFragment
         }
        }
        
        fragment MyFragment on DGQL {
          node @node
        }
      `);

      const newDoc = prepareDocument({
        document: doc,
        variables: { truthy: true, falsy: false },
      });

      const printed = print(newDoc);

      expect(printed).toEqual(
        print(
          parse(`
            {
              MATCH {
                node @node
              }
            }
          `)
        )
      );
    });
  });
});
