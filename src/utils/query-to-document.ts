import { DocumentNode, parse, print } from "graphql";
import * as types from "../types";

function selectionSetToDocument(query: types.Query): DocumentNode {
    if (typeof query === "string") {
        return parse(query);
    }

    return parse(print(query));
}

export default selectionSetToDocument;
