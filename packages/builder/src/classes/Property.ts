import type { SortDirection, PropertyInput } from "../types";

class Property {
  equal?: any;

  direction?: SortDirection;

  value?: any;

  regex?: string;

  constructor(input: PropertyInput = {}) {
    this.equal = input.equal;
    this.direction = input.direction;
    this.value = input.value;
    this.regex = input.regex;
  }
}

export default Property;
