import { NodeProjectInput, NodeInput } from "../types";

class Node {
    label?: string;
    whereInput?: Record<string, unknown>;
    projectInput?: NodeProjectInput;

    constructor(input: NodeInput = {}) {
        this.label = input.label;
    }

    where(input: Record<string, unknown>): Node {
        this.whereInput = input;

        return this;
    }

    project(input: NodeProjectInput): Node {
        this.projectInput = input;

        return this;
    }
}

export default Node;
