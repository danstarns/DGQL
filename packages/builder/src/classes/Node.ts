import Property from "./Property";
import Edge from "./Edge";

export interface NodeProjectInput {
    [k: string]: Property | Edge;
}

interface NodeInput {
    label?: string;
}

export interface NodeSort {
    [k: string]: Property;
}

export interface WhereInput {
    [k: string]: Property;
}

export interface NodePaginate {
    skip?: number;
    limit?: number;
    sort?: NodeSort;
}

class Node {
    label?: string;
    whereInput?: WhereInput;
    projectInput?: NodeProjectInput;
    paginateInput?: NodePaginate;

    constructor(input: NodeInput = {}) {
        this.label = input.label;
    }

    where(input: WhereInput): Node {
        this.whereInput = input;

        return this;
    }

    project(input: NodeProjectInput): Node {
        this.projectInput = input;

        return this;
    }

    paginate(input: NodePaginate): Node {
        this.paginateInput = input;

        return this;
    }
}

export default Node;
