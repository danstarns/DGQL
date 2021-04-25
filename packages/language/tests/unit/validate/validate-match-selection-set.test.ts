import { FieldNode, parse, printError, SelectionSetNode } from "graphql";
import { validateMatchSelectionSet } from "../../../src/validate";
import trimmer from "../utils/trimmer";

describe("validateMatchSelectionSet", () => {
  describe("@cypher", () => {
    test("should throw @cypher to be used alone", () => {
      const doc = parse(`
        {
            MATCH {
              custom @cypher @node
            }
        }
      `);

      try {
        validateMatchSelectionSet({
          selectionSetNode: (((doc.definitions[0] as unknown) as FieldNode)
            .selectionSet?.selections[0] as FieldNode)
            .selectionSet as SelectionSetNode,
        });
      } catch (error) {
        expect(trimmer(printError(error))).toEqual(
          trimmer(`
          Unexpected error value: "@cypher to be used alone"

          GraphQL request:4:15
          3 |                 MATCH {
          4 |                   custom @cypher @node
            |                   ^
          5 |                 }
        `)
        );
      }
    });
  });

  test("should throw Fields are only supported here", () => {
    const doc = parse(`
      {
          MATCH {
            ... on Test {
              test
            }
          }
      }
    `);

    try {
      validateMatchSelectionSet({
        selectionSetNode: (((doc.definitions[0] as unknown) as FieldNode)
          .selectionSet?.selections[0] as FieldNode)
          .selectionSet as SelectionSetNode,
      });
    } catch (error) {
      expect(trimmer(printError(error))).toEqual(
        trimmer(`
        Unexpected error value: "Fields are only supported here"

        GraphQL request:4:13
        3 |               MATCH {
        4 |                 ... on Test {
          |                 ^
        5 |                   test
    `)
      );
    }
  });

  test("should throw directive test not allowed here", () => {
    const doc = parse(`
      {
          MATCH {
            node @test
          }
      }
    `);

    try {
      validateMatchSelectionSet({
        selectionSetNode: (((doc.definitions[0] as unknown) as FieldNode)
          .selectionSet?.selections[0] as FieldNode)
          .selectionSet as SelectionSetNode,
      });
    } catch (error) {
      expect(trimmer(printError(error))).toEqual(
        trimmer(`
        Unexpected error value: "directives test not allowed here"

        GraphQL request:4:13
        3 |               MATCH {
        4 |                 node @test
          |                 ^
        5 |               }
    `)
      );
    }
  });

  test("should throw @node or @cypher directive missing", () => {
    const doc = parse(`
      {
          MATCH {
            node
          }
      }
    `);

    try {
      validateMatchSelectionSet({
        selectionSetNode: (((doc.definitions[0] as unknown) as FieldNode)
          .selectionSet?.selections[0] as FieldNode)
          .selectionSet as SelectionSetNode,
      });
    } catch (error) {
      expect(trimmer(printError(error))).toEqual(
        trimmer(`
        Unexpected error value: "@node or @cypher directive missing"

        GraphQL request:4:13
        3 |               MATCH {
        4 |                 node
          |                 ^
        5 |               }
    `)
      );
    }
  });

  test("should throw only one @node directive allowed", () => {
    const doc = parse(`
      {
          MATCH {
            node @node @node
          }
      }
    `);

    try {
      validateMatchSelectionSet({
        selectionSetNode: (((doc.definitions[0] as unknown) as FieldNode)
          .selectionSet?.selections[0] as FieldNode)
          .selectionSet as SelectionSetNode,
      });
    } catch (error) {
      expect(trimmer(printError(error))).toEqual(
        trimmer(`
        Unexpected error value: "only one @node directive allowed"

        GraphQL request:4:13
        3 |               MATCH {
        4 |                 node @node @node
          |                 ^
        5 |               }
    `)
      );
    }
  });
});
