import { ApolloServer } from "apollo-server-express";
import express from "express";
import { typeDefs } from "./schema.ts";
import { resolvers } from "./resolvers.ts";

async function start() {
  const app = express();

  const server = new ApolloServer({ typeDefs, resolvers });

  await server.start();

  server.applyMiddleware({ app });

  app.listen(4000, () => console.log("Server running on http://localhost:4000/graphql"));
}

start();