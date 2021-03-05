import { Client } from "../../src";
import { expect } from "chai";

describe("Client", () => {
    it("should construct", () => {
        // @ts-ignore
        expect(new Client({})).to.be.instanceof(Client);
    });
});
