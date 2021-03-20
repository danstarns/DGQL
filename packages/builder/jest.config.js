module.exports = {
    roots: ["tests"],
    transform: {
        "^.+\\.ts$": "ts-jest",
    },
    testTimeout: 120000,
    testMatch: [`./**/*.test.ts`],
    moduleFileExtensions: ["js", "json", "jsx", "ts", "tsx", "node", "md"],
};
