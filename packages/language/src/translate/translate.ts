import { FieldNode, OperationDefinitionNode } from "graphql";
import { Query, Translation } from "../types";
import createMatchAndParams from "./create-match-and-params";
import { queryToDocument } from "../utils";
import createCreateAndParams from "./create-create-and-params";
import createUpdateAndParams from "./create-update-and-params";
import createDeleteAndParams from "./create-delete-and-params";
import { validate } from "../validate";

function translate({
  query,
  variables: inVars = {},
  shouldPrintError,
}: {
  query: Query;
  variables?: Record<string, unknown>;
  shouldPrintError?: boolean;
}): Translation {
  const cyphers: string[] = [];
  let params: Record<string, unknown> = {};

  const { document, variables } = validate({
    document: queryToDocument(query),
    variables: inVars,
    shouldPrintError,
  });
  const root = document.definitions[0] as OperationDefinitionNode;
  const selections = root.selectionSet.selections as FieldNode[];
  let returnSelection: FieldNode | undefined;

  selections.forEach((selection, i) => {
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
