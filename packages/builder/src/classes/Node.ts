import Property from "./Property";

export interface NodeProjectInput {
    [k: string]: Property;
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

export interface NodePagination {
    skip?: number;
    limit?: number;
    sort?: NodeSort;
}

class Node {
    label?: string;
    whereInput?: WhereInput;
    projectInput?: NodeProjectInput;
    paginationInput?: NodePagination;

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

    pagination(input: NodePagination): Node {
        this.paginationInput = input;

        return this;
    }
}

export default Node;
