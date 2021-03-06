function removeLoc(obj: any) {
    return JSON.parse(
        JSON.stringify(obj, (key, value) => {
            if (key === "loc") {
                return undefined;
            }

            return value;
        })
    );
}

export default removeLoc;
