import { Node } from "../classes";

function node(input?: { label?: string }) {
    return new Node(input);
}

export default node;
