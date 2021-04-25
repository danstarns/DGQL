import {
  FieldNode,
  SelectionNode,
  SelectionSetNode,
  DirectiveNode,
} from "graphql";
import {
  createWhereSelectionAndParams,
  createPaginationDirectiveNode,
  createSortSelectionNode,
  createProjectionSelectionAndParams,
} from ".";
import { MatchInput } from "../types";

function createMatchSelectionNodeAndParams({
  match,
}: {
  match: MatchInput;
}): [SelectionNode, any] {
  let params = {};

  const selection: SelectionNode = {
    kind: "Field",
    name: { kind: "Name", value: "MATCH" },
    selectionSet: {
      kind: "SelectionSet",
      selections: Object.entries(match).map((entry) => {
        const field: FieldNode = {
          kind: "Field",
          name: { kind: "Name", value: entry[0] },
          directives: [
            {
              kind: "Directive",
              name: { kind: "Name", value: "node" },
              ...(entry[1].label
                ? {
                    arguments: [
                      {
                        kind: "Argument",
                        name: {
                          kind: "Name",
                          value: "label",
                        },
                        value: {
                          kind: "EnumValue",
                          value: entry[1].label,
                        },
                      },
                    ],
                  }
                : {}),
            },
          ],
        };

        let selections: SelectionNode[] = [];

        if (entry[1].whereInput) {
          const [whereSelection, p] = createWhereSelectionAndParams({
            parentName: `match_${entry[0]}`,
            whereInput: entry[1].whereInput,
          });
          params = { ...params, ...p };
          selections.push(whereSelection);
        }

        if (entry[1].paginateInput) {
          const directive = createPaginationDirectiveNode({
            paginateInput: entry[1].paginateInput,
          });

          if (directive.arguments?.length) {
            (field.directives as DirectiveNode[]).push(directive);
          }

          if (entry[1].paginateInput?.sort) {
            const selection = createSortSelectionNode({
              sortInput: entry[1].paginateInput.sort,
            });

            selections.push(selection);
          }
        }

        if (entry[1].projectInput) {
          const [projectionSelection, p] = createProjectionSelectionAndParams({
            parentName: `match_${entry[0]}`,
            projectInput: entry[1].projectInput,
          });
          params = { ...params, ...p };
          selections.push(projectionSelection);
        }

        if (selections.length) {
          (field.selectionSet as SelectionSetNode) = {
            kind: "SelectionSet",
            selections,
          };
        }

        return field;
      }),
    },
  };

  return [selection, params];
}

export default createMatchSelectionNodeAndParams;
