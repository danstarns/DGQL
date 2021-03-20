import { DocumentNode, FieldNode, print, SelectionNode } from "graphql";
import Node from "./Node";
import createDGQLAndParams from "../create-dgql-and-params";
interface MatchInput {
    [k: string]: Node;
}

class Builder {
    matches: MatchInput[];

    returnInput?: string[];

    constructor() {
        this.matches = [];
    }

    match(input: MatchInput): Builder {
        this.matches.push(input);

        return this;
    }

    return(input: string[]): Builder {
        this.returnInput = input;

        return this;
    }

    build(): [string, Record<string, unknown>] {
        return createDGQLAndParams({
            matches: this.matches || [],
            returnStrings: this.returnInput || [],
        });
    }
}

export default Builder;
