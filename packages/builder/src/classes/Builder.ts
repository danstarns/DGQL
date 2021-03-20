import { NodeInput } from "../types";
import Node from "./Node";

class Builder {
    constructor() {}

    node(input?: NodeInput): Node {
        return new Node(input);
    }

    match() {}

    return() {}

    build(): [string, Record<string, unknown>] {
        return ["", {}];
    }
}

const builder = new Builder();

export default Builder;
