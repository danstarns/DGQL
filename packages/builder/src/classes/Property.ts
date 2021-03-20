interface PropertyConstructor {
    equal?: any;
}

class Property {
    equal?: any;

    constructor(input: PropertyConstructor = {}) {
        this.equal = input.equal;
    }
}

export default Property;
