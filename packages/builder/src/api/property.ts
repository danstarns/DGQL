import { Property } from "../classes";
import type { PropertyInput } from "../types";

function property(input: PropertyInput = {}) {
  return new Property(input);
}

export default property;
