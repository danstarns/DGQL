import { EdgeInput, EdgeProjectInput } from "../types";

class Edge {
    type: string;
    direction: "IN" | "OUT";

    projectInput?: EdgeProjectInput;

    constructor(input: EdgeInput) {
        this.type = input.type;
        this.direction = input.direction;
    }

    project(input: EdgeProjectInput) {
        this.projectInput = input;
    }
}

export default Edge;
