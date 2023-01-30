import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphql, GraphQLSchema } from 'graphql';
import { queryType } from './query';
import { graphqlBodySchema } from './schema';

const MyAppSchema = new GraphQLSchema({
  query: queryType,
});

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.post(
    '/',
    {
      schema: {
        body: graphqlBodySchema,
      },
    },
    async function (request, reply) {
      return await graphql({
        schema: MyAppSchema,
        source: request.body.query?.toString() || '',
        contextValue: fastify,
        variableValues: request.body.variables,
      });
    }
  );
};

export default plugin;
