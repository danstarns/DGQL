import { DocumentNode, parse, print } from "graphql";
import * as types from "../types";

function selectionSetToDocument(
    selectionSet: types.SelectionSet
): DocumentNode {
    if (typeof selectionSet === "string") {
        return parse(selectionSet);
    }

    return parse(print(selectionSet));
}

export default selectionSetToDocument;
