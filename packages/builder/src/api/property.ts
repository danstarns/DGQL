import { Property } from "../classes";

function property(input: { equal?: any } = {}) {
    return new Property(input);
}

export default property;
