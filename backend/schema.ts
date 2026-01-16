import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type Task {
    id: ID!
    title: String!
    completed: Boolean
  }

  type Query {
    tasks: [Task]
  }

  type Mutation {
    createTask(title: String!): Task
    toggleTask(id: ID!): Task
  }
`;
