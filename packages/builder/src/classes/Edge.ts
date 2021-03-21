import { EdgeDirection } from "../types";
import Node, { NodeProjectInput } from "./Node";
import Property from "./Property";

export interface EdgeInput {
    type: string;
    direction: EdgeDirection;
    node?: Node;
}

export interface EdgeProjectInput {
    [k: string]: Node | Property;
}

class Edge {
    type: string;
    direction: "IN" | "OUT";
    node?: Node;

    projectInput?: EdgeProjectInput | NodeProjectInput;

    constructor(input: EdgeInput) {
        this.type = input.type;
        this.direction = input.direction;
        this.node = input.node;
    }

    project(input: EdgeProjectInput | NodeProjectInput): Edge {
        this.projectInput = input;

        return this;
    }
}

export default Edge;
