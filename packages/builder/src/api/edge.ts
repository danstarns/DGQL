import { Edge } from "../classes";
import { EdgeInput } from "../types";

function edge(input: EdgeInput) {
    return new Edge(input);
}

export default edge;
