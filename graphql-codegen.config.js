require("dotenv").config();

module.exports = {
  overwrite: true,
  schema: {
    [process.env.URL_GRAPHQL]: {
      headers: { Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` },
    },
  },
  documents: [
    "src/shared/fragments/*.graphql",
    "src/core/graphql/operations/*.graphql",
    "src/core/graphql/fragments/*.graphql",
  ],
  generates: {
    "src/core/graphql/generated.ts": {
      plugins: ["typescript", "typescript-operations", "typescript-graphql-request"],
    },
  },
};
