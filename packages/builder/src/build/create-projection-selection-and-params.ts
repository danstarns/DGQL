import { FieldNode, SelectionNode, ArgumentNode, DirectiveNode } from "graphql";
import { Property, NodeProjectInput, Edge } from "../classes";
import { createWhereDirectiveAndParams } from ".";

function createProjectionSelectionAndParams({
  projectInput,
  parentName,
}: {
  projectInput: NodeProjectInput;
  parentName: string;
}): [FieldNode, any] {
  let params = {};

  const projectionSelections = Object.entries(projectInput)
    .filter((x) => x[1] instanceof Property || x[1] instanceof Edge)
    .map((x) => {
      const value = x[1] as Property | Edge;
      const key = x[0];

      if (value instanceof Property) {
        const selection: SelectionNode = {
          kind: "Field",
          name: { kind: "Name", value: key },
        };

        return selection;
      }

      if (value instanceof Edge) {
        const selection: SelectionNode = {
          kind: "Field",
          name: { kind: "Name", value: key },
          directives: [],
          selectionSet: { kind: "SelectionSet", selections: [] },
        };

        const edgeDirective: DirectiveNode = {
          kind: "Directive",
          name: { kind: "Name", value: "edge" },
          arguments: [
            {
              kind: "Argument",
              name: { kind: "Name", value: "type" },
              value: {
                kind: "EnumValue",
                value: value.type,
              },
            },
            {
              kind: "Argument",
              name: { kind: "Name", value: "direction" },
              value: {
                kind: "EnumValue",
                value: value.direction,
              },
            },
          ],
        };

        (selection.directives as DirectiveNode[]).push(edgeDirective);

        if (value.node) {
          const nodeDirective: DirectiveNode = {
            kind: "Directive",
            name: {
              kind: "Name",
              value: "node",
            },
            arguments: [],
          };

          if (value.node.label) {
            const labelArg: ArgumentNode = {
              kind: "Argument",
              name: { kind: "Name", value: "label" },
              value: {
                kind: "EnumValue",
                value: value.node.label,
              },
            };

            (nodeDirective.arguments as ArgumentNode[]).push(labelArg);
          }

          (selection.directives as DirectiveNode[]).push(nodeDirective);

          if (value.projectInput) {
            const [sel, p] = createProjectionSelectionAndParams({
              projectInput: value.projectInput as NodeProjectInput,
              parentName: `${parentName}_${key}`,
            });

            params = { ...params, ...p };
            // @ts-ignore
            selection.selectionSet?.selections = sel.selectionSet
              ?.selections as FieldNode[];
          }

          if (value.node.whereInput) {
            const [whereDirec, p] = createWhereDirectiveAndParams({
              whereInput: value.node.whereInput,
              parentName: `${parentName}_${key}_where`,
            });
            params = { ...params, ...p };
            (selection.directives as DirectiveNode[]).push(whereDirec);
          }
        }

        return selection;
      }
    }) as SelectionNode[];

  const projectionSelection: FieldNode = {
    kind: "Field",
    name: {
      kind: "Name",
      value: "PROJECT",
    },
    selectionSet: {
      kind: "SelectionSet",
      selections: projectionSelections,
    },
  };

  return [projectionSelection, params];
}

export default createProjectionSelectionAndParams;
