import { parse, printError } from "graphql";
import { validateProject } from "../../../src/validate";
import trimmer from "../utils/trimmer";

describe("validateProject", () => {
  test("should throw PROJECT requires a selection", () => {
    const doc = parse(`
      {
         MATCH {
             node @node {
                 PROJECT
             }
         }
      }
    `);

    try {
      validateProject({
        projectField:
          // @ts-ignore
          doc.definitions[0].selectionSet?.selections[0].selectionSet
            ?.selections[0].selectionSet.selections[0],
        variables: {},
        path: undefined,
        type: "node",
      });

      throw Error();
    } catch (error) {
      expect(trimmer(printError(error))).toEqual(
        trimmer(`
          Unexpected error value: "PROJECT requires a selection"

          GraphQL request:5:18
          4 |              node @node {
          5 |                  PROJECT
            |                  ^
          6 |              }
      `)
      );
    }
  });

  test("should throw field requires no arguments", () => {
    const doc = parse(`
    {
       MATCH {
           node @node {
               PROJECT {
                 name(arg: 123)
               }
           }
       }
    }
  `);

    try {
      validateProject({
        projectField:
          // @ts-ignore
          doc.definitions[0].selectionSet?.selections[0].selectionSet
            ?.selections[0].selectionSet.selections[0],
        variables: {},
        path: undefined,
        type: "node",
      });

      throw Error();
    } catch (error) {
      expect(trimmer(printError(error))).toEqual(
        trimmer(`
        Unexpected error value: "Field requires no arguments"

        GraphQL request:6:18
        5 |                PROJECT {
        6 |                  name(arg: 123)
          |                  ^
        7 |                }
    `)
      );
    }
  });

  test("should throw field requires no directives", () => {
    const doc = parse(`
    {
       MATCH {
           node @node {
               PROJECT {
                 name @abc
               }
           }
       }
    }
  `);

    try {
      validateProject({
        projectField:
          // @ts-ignore
          doc.definitions[0].selectionSet?.selections[0].selectionSet
            ?.selections[0].selectionSet.selections[0],
        variables: {},
        path: undefined,
        type: "node",
      });

      throw Error();
    } catch (error) {
      expect(trimmer(printError(error))).toEqual(
        trimmer(`
        Unexpected error value: "Field requires no directives"

        GraphQL request:6:18
        5 |                PROJECT {
        6 |                  name @abc
          |                  ^
        7 |                }
    `)
      );
    }
  });

  describe("when user adds an edge", () => {
    test("should throw if the projection is not for a node", () => {
      const doc = parse(`
      {
         MATCH {
             node @node {
                 PROJECT {
                   name @edge(type: HAS_X, direction: OUT)
                 }
             }
         }
      }
    `);

      try {
        validateProject({
          projectField:
            // @ts-ignore
            doc.definitions[0].selectionSet?.selections[0].selectionSet
              ?.selections[0].selectionSet.selections[0],
          variables: {},
          path: undefined,
          type: "relationship",
        });

        throw Error();
      } catch (error) {
        expect(trimmer(printError(error))).toEqual(
          trimmer(`
          Unexpected error value: "Cannot edge on relationship properties"
  
          GraphQL request:6:20
          5 |                PROJECT {
          6 |                  name @edge(type: HAS_X, direction: OUT)
            |                  ^
          7 |                }
      `)
        );
      }
    });
  });

  describe("when user has @cypher", () => {
    test("should throw one of the cypher errors", () => {
      const doc = parse(`
      {
         MATCH {
             node @node {
                 PROJECT {
                   name @cypher
                 }
             }
         }
      }
    `);

      try {
        validateProject({
          projectField:
            // @ts-ignore
            doc.definitions[0].selectionSet?.selections[0].selectionSet
              ?.selections[0].selectionSet.selections[0],
          variables: {},
          path: undefined,
          type: "node",
        });

        throw Error();
      } catch (error) {
        expect(trimmer(printError(error))).toEqual(
          trimmer(`
          Unexpected error value: "@cypher requires arguments statement and or arguments"

          GraphQL request:6:25
          5 |                  PROJECT {
          6 |                    name @cypher
            |                         ^
          7 |                  }
      `)
        );
      }
    });
  });
});
