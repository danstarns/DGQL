import { FieldNode, OperationDefinitionNode } from "graphql";
import { Query, Translation } from "../types";
import createMatchAndParams from "./create-match-and-params";
import {
  queryToDocument,
  filterDocumentWithConditionalSelection,
} from "../utils";
import createCreateAndParams from "./create-create-and-params";
import createUpdateAndParams from "./create-update-and-params";
import createDeleteAndParams from "./create-delete-and-params";

function translate({
  query,
  variables = {},
}: {
  query: Query;
  variables?: Record<string, unknown>;
}): Translation {
  const cyphers: string[] = [];
  let params: Record<string, unknown> = {};

  const document = filterDocumentWithConditionalSelection({
    document: queryToDocument(query),
    variables,
  });
  const root = document.definitions[0] as OperationDefinitionNode;
  const selections = root.selectionSet.selections;

  let returnSelection: FieldNode | undefined;

  selections.forEach((selection, i) => {
    if (!selection) {
      console.log(JSON.stringify(document, null, 2));
    }

    if (selection.kind !== "Field") {
      throw new Error("Fields are only supported here");
    }

    const validSelections = ["MATCH", "CREATE", "UPDATE", "DELETE", "RETURN"];
    if (!validSelections.includes(selection.name.value)) {
      throw new Error(`Invalid selection: ${selection.name.value}`);
    }

    if (selection.name.value === "RETURN") {
      returnSelection = selection;

      return;
    }

    if (selection.name.value === "MATCH") {
      const [match, mParams] = createMatchAndParams({
        matchField: selection,
        variables,
      });
      cyphers.push(match);
      params = { ...params, ...mParams };

      return;
    }

    if (selection.name.value === "CREATE") {
      const [create, mParams] = createCreateAndParams({
        createField: selection,
        variables,
        withVars: [],
      });
      cyphers.push(create);
      params = { ...params, ...mParams };

      return;
    }

    if (selection.name.value === "UPDATE") {
      const [update, mParams] = createUpdateAndParams({
        updateField: selection,
        variables,
        withVars: [],
      });
      cyphers.push(update);
      params = { ...params, ...mParams };

      return;
    }

    if (selection.name.value === "DELETE") {
      const [del, mParams] = createDeleteAndParams({
        deleteField: selection,
        variables,
        withVars: [],
        chainStr: `delete${i}`,
      });
      cyphers.push(del);
      params = { ...params, ...mParams };

      return;
    }
  });

  let returnVariables: string[] = [];
  if (returnSelection?.selectionSet?.selections.length) {
    returnVariables = ((returnSelection.selectionSet?.selections ||
      []) as FieldNode[]).map((s: FieldNode) => s.name.value);
    cyphers.push(`RETURN ${returnVariables.join(", ")}`);
  } else {
    cyphers.push(`RETURN COUNT(*)`);
  }

  params = { params: { ...params } };

  return {
    cypher: cyphers.join("\n"),
    params,
    returnVariables,
  };
}

export default translate;
