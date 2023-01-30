import { FastifyInstance } from 'fastify';
import { GraphQLList, GraphQLObjectType } from 'graphql';
import { userDataType } from './types';

const usersQuery = {
  type: new GraphQLList(userDataType),
  resolve: async (_: any, __: any, fastify: FastifyInstance) => {
    const users = await fastify.db.users.findMany();
    if (users) {
      return users
    } else {
      throw fastify.httpErrors.notFound()
    };
  },
};

export const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    users: usersQuery,
  },
});