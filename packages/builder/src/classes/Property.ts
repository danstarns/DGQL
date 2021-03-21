import { SortDirection } from "../types";

interface PropertyConstructor {
    equal?: any;
    direction?: SortDirection;
}

class Property {
    equal?: any;

    direction?: SortDirection;

    constructor(input: PropertyConstructor = {}) {
        this.equal = input.equal;
        this.direction = input.direction;
    }
}

export default Property;
