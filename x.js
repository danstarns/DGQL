const { DGQLBuilder, node, property, edge } = require("@dgql/builder");

const builder = new DGQLBuilder();

const match = builder.match({
    user: builder
        .node({ label: "User" })
        .where({ name: "Dan" })
        .project({
            id: property(),
            name: property(),
            posts: edge({
                type: "HAS_POST",
                direction: "OUT",
                node: node({ label: "Post" }),
            }).project({
                title: property(),
            }),
        }),
});

builder.return({
    user: match.user,
});

const [cypher, params] = builder.translate();
