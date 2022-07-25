import { ApolloServer } from "apollo-server-express";
import express from "express";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./module/hello/Hello.resolver";
import { UserResolver } from "./module/user/User.resolver";
import jwt from 'jsonwebtoken';
import { Context } from "./module/shared/type/Context.interface";


const main = async () => {
  const schema = await buildSchema({
    resolvers: [HelloResolver, UserResolver],
  });
  const apoloServer = new ApolloServer({
    schema, context: ({ req }) => {
      let customContext: Context = {} as Context;
      customContext.req = req;
      if (req.headers.authorization) {
        try {
          const token = req.headers.authorization.split(" ")[1];
          const payload = jwt.verify(token, process.env.JWT_SECRET);
          customContext.userId = payload.sub as string;
        } catch (error) {

        }
      }
      return customContext;
    }
  });

  const app = express();

  await apoloServer.start();

  apoloServer.applyMiddleware({ app });

  app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${apoloServer.graphqlPath}`)
  );
};

main();