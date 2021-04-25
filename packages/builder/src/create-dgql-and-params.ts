import { DocumentNode, SelectionNode, print } from "graphql";
import {
  createReturnSelection,
  createCreateSelectionNodeAndParams,
  createMatchSelectionNodeAndParams,
} from "./build";
import type { Operation } from "./types";

function createDGQLAndParams({
  operations,
  returnStrings,
}: {
  operations: Operation[];
  returnStrings: string[];
}): [string, any] {
  let params = {};
  let selections: SelectionNode[] = [];
  if (!operations.length) {
    return ["", {}];
  }

  operations.forEach((operation) => {
    switch (operation.kind) {
      case "CREATE":
        {
          const cSAP = createCreateSelectionNodeAndParams({
            create: operation.input,
          });
          selections.push(cSAP[0]);
          params = { ...params, ...cSAP[1] };
        }
        break;
      default: {
        const mSAP = createMatchSelectionNodeAndParams({
          match: operation.input,
        });
        selections.push(mSAP[0]);
        params = { ...params, ...mSAP[1] };
      }
    }
  });

  const returnSelectionNode = createReturnSelection(returnStrings);
  selections.push(returnSelectionNode);

  const document: DocumentNode = {
    kind: "Document",
    definitions: [
      {
        kind: "OperationDefinition",
        operation: "query",
        selectionSet: {
          kind: "SelectionSet",
          selections,
        },
      },
    ],
  };

  return [print(document), params];
}

export default createDGQLAndParams;
