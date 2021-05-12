import { FieldNode, parse, printError, SelectionSetNode } from "graphql";
import { validateEdgeSelection } from "../../../src/validate";
import trimmer from "../utils/trimmer";

describe("validateEdgeSelection", () => {
  test("should throw edge must have a selection", () => {
    const doc = parse(`
        {
            edge @edge(type: HAS_EDGE)
        }
      `);

    try {
      validateEdgeSelection({
        variables: {},
        // @ts-ignore
        edgeSelection: doc.definitions[0].selectionSet.selections[0],
        path: undefined,
      });

      throw new Error();
    } catch (error) {
      expect(trimmer(printError(error))).toEqual(
        trimmer(`
            Unexpected error value: "Edge must have a selection"

            GraphQL request:3:13
            2 |         {
            3 |             edge @edge(type: HAS_EDGE)
              |             ^
            4 |         }
        `)
      );
    }
  });

  test("should throw Invalid directive on edge", () => {
    const doc = parse(`
        {
            edge @edge(type: HAS_EDGE) @invalid {
                name
            }
        }
      `);

    try {
      validateEdgeSelection({
        variables: {},
        // @ts-ignore
        edgeSelection: doc.definitions[0].selectionSet.selections[0],
        path: undefined,
      });

      throw new Error();
    } catch (error) {
      expect(trimmer(printError(error))).toEqual(
        trimmer(`
            Unexpected error value: "Invalid directive(s) on edge invalid"

            GraphQL request:3:13
            2 |         {
            3 |             edge @edge(type: HAS_EDGE) @invalid {
              |             ^
            4 |                 name
        `)
      );
    }
  });

  describe("when user projects the node", () => {
    test("should throw one of the validateProject errors", () => {
      const doc = parse(`
        {
            edge @edge(type: HAS_EDGE) @node {
                name @abc
            }
        }
      `);

      try {
        validateEdgeSelection({
          variables: {},
          // @ts-ignore
          edgeSelection: doc.definitions[0].selectionSet.selections[0],
          path: undefined,
        });

        throw new Error();
      } catch (error) {
        expect(trimmer(printError(error))).toEqual(
          trimmer(`
            Unexpected error value: "Field requires no directives"

            GraphQL request:4:17
            3 |             edge @edge(type: HAS_EDGE) @node {
            4 |                 name @abc
              |                 ^
            5 |             }
        `)
        );
      }
    });

    test("should throw one of the validateNodeDirective errors", () => {
      const doc = parse(`
        {
            edge @edge(type: HAS_EDGE) @node(label: 123) {
                name @abc
            }
        }
      `);

      try {
        validateEdgeSelection({
          variables: {},
          // @ts-ignore
          edgeSelection: doc.definitions[0].selectionSet.selections[0],
          path: undefined,
        });

        throw new Error();
      } catch (error) {
        expect(trimmer(printError(error))).toEqual(
          trimmer(`
            Unexpected error value: "@node label must be of type StringValue or Argument or EnumValue"

            GraphQL request:3:40
            2 |         {
            3 |             edge @edge(type: HAS_EDGE) @node(label: 123) {
              |                                        ^
            4 |                 name @abc
        `)
        );
      }
    });
  });

  describe("Expand the edge", () => {
    test("should throw Invalid directive on edge field", () => {
      const doc = parse(`
        {
            edge @edge(type: HAS_EDGE) {
                name @abc
            }
        }
      `);

      try {
        validateEdgeSelection({
          variables: {},
          // @ts-ignore
          edgeSelection: doc.definitions[0].selectionSet.selections[0],
          path: undefined,
        });

        throw new Error();
      } catch (error) {
        expect(trimmer(printError(error))).toEqual(
          trimmer(`
            Unexpected error value: "Invalid directive(s) 'abc' on edge field"

            GraphQL request:4:17
            3 |             edge @edge(type: HAS_EDGE) {
            4 |                 name @abc
              |                 ^
            5 |             }
        `)
        );
      }
    });

    test("should throw No arguments needed on edge field", () => {
      const doc = parse(`
        {
            edge @edge(type: HAS_EDGE) {
                name(arg: 123)
            }
        }
      `);

      try {
        validateEdgeSelection({
          variables: {},
          // @ts-ignore
          edgeSelection: doc.definitions[0].selectionSet.selections[0],
          path: undefined,
        });

        throw new Error();
      } catch (error) {
        expect(trimmer(printError(error))).toEqual(
          trimmer(`
            Unexpected error value: "No arguments needed on edge field"

            GraphQL request:4:17
            3 |             edge @edge(type: HAS_EDGE) {
            4 |                 name(arg: 123)
              |                 ^
            5 |             }
        `)
        );
      }
    });

    test("should throw invalid selection", () => {
      const doc = parse(`
        {
            edge @edge(type: HAS_EDGE) {
                name
            }
        }
      `);

      try {
        validateEdgeSelection({
          variables: {},
          // @ts-ignore
          edgeSelection: doc.definitions[0].selectionSet.selections[0],
          path: undefined,
        });

        throw new Error();
      } catch (error) {
        expect(trimmer(printError(error))).toEqual(
          trimmer(`
            Unexpected error value: "Invalid edge selection, try using @node or PROPERTIES"

            GraphQL request:4:17
            3 |             edge @edge(type: HAS_EDGE) {
            4 |                 name
              |                 ^
            5 |             }
        `)
        );
      }
    });

    test("should throw one of the errors from validatePropertiesSelection", () => {
      const doc = parse(`
        {
            edge @edge(type: HAS_EDGE) {
                PROPERTIES {
                    abc @edge(type: HAS_X, direction: OUT)
                }
            }
        }
      `);

      try {
        validateEdgeSelection({
          variables: {},
          // @ts-ignore
          edgeSelection: doc.definitions[0].selectionSet.selections[0],
          path: undefined,
        });

        throw new Error();
      } catch (error) {
        expect(trimmer(printError(error))).toEqual(
          trimmer(`
            Unexpected error value: "Invalid PROPERTIES selection, try one of PROJECT or WHERE"

            GraphQL request:4:17
            3 |             edge @edge(type: HAS_EDGE) {
            4 |                 PROPERTIES {
              |                 ^
            5 |                     abc @edge(type: HAS_X, direction: OUT)
        `)
        );
      }
    });

    test("should throw one of the errors from validateNodeSelection", () => {
      const doc = parse(`
        {
            edge @edge(type: HAS_EDGE) {
                node @node {
                    abc
                }
            }
        }
      `);

      try {
        validateEdgeSelection({
          variables: {},
          // @ts-ignore
          edgeSelection: doc.definitions[0].selectionSet.selections[0],
          path: undefined,
        });

        throw new Error();
      } catch (error) {
        expect(trimmer(printError(error))).toEqual(
          trimmer(`
            Unexpected error value: "Invalid node selection try one of; PROJECT, WHERE, SORT"

            GraphQL request:5:21
            4 |                 node @node {
            5 |                     abc
              |                     ^
            6 |                 }
        `)
        );
      }
    });
  });
});
