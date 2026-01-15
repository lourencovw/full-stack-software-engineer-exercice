const { default: db } = require("./db.ts");


module.exports = {
  Query: {
    tasks: async () => {
      return await db("tasks").select("*");
    },
  },

  Mutation: {
    createTask: async (_, { title }) => {
      const [inserted] = await db("tasks").insert({ title, completed: false }).returning("*");
      return inserted;
    },

    toggleTask: async (_, { id }) => {
      const task = db("tasks").where("id", id).first();

      await db("tasks").where("id", id).update({ completed: !task.completed });

      return task;
    },
  },
};
