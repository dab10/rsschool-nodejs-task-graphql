import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createPostBodySchema, changePostBodySchema } from './schema';
import type { PostEntity } from '../../utils/DB/entities/DBPosts';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<PostEntity[]> {
    const posts = await fastify.db.posts.findMany();
    if (posts) {
      return posts
    } else {
      throw fastify.httpErrors.notFound()
    };
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const id = request.params.id;
      const post = await fastify.db.posts.findOne({ key: 'id', equals: id });

      if (post) {
        return post;
      } else {
        throw fastify.httpErrors.notFound();
      };
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createPostBodySchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const post = request.body;
      if (post) {
        return await fastify.db.posts.create(post);
      } else {
        throw fastify.httpErrors.badRequest();
      };
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const id = request.params.id;
      const post = await fastify.db.posts.findOne({ key: 'id', equals: id });
      if (post) {
        return await fastify.db.posts.delete(id);
      } else {
        throw fastify.httpErrors.badRequest();
      };
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changePostBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const id = request.params.id;
      const newPost = request.body; 
      const post = await fastify.db.posts.findOne({ key: 'id', equals: id });
      if (post) {
        return await fastify.db.posts.change(id, newPost);
      } else {
        throw fastify.httpErrors.badRequest();
      };
    }
  );
};

export default plugin;
