import { Node } from "../classes";
import { NodeInput } from "../types";

function node(input?: NodeInput) {
    return new Node(input);
}

export default node;
