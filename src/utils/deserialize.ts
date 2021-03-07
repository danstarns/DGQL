import { isDate, isInt, Date as Neo4jDate, isDateTime } from "neo4j-driver";

function replacer(_: any, value: any): any {
    if (isInt(value)) {
        return value.toNumber();
    }

    if (isDate(value) || isDateTime(value)) {
        return new Date(value.toString()).toISOString();
    }

    return value;
}

function deserialize(result: any): any {
    return JSON.parse(JSON.stringify(result, replacer));
}

export default deserialize;
