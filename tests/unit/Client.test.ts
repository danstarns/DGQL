import { Client } from "../../src";

describe("Client", () => {
    it("should construct", () => {
        // @ts-ignore
        expect(new Client({})).toBeInstanceOf(Client);
    });
});
