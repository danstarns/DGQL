import type { SortDirection, PropertyInput } from "../types";

class Property {
  equal?: any;

  direction?: SortDirection;

  value?: any;

  constructor(input: PropertyInput = {}) {
    this.equal = input.equal;
    this.direction = input.direction;
    this.value = input.value;
  }
}

export default Property;
