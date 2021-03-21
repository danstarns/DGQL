import { Property } from "../classes";
import { SortDirection } from "../types";

function property(input: { equal?: any; direction?: SortDirection } = {}) {
    return new Property(input);
}

export default property;
