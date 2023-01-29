import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<UserEntity[]> {
    const users = await fastify.db.users.findMany();
    if (users) {
      return users
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
    async function (request, reply): Promise<UserEntity> {
      const id = request.params.id;
      const user = await fastify.db.users.findOne({ key: 'id', equals: id });
      if (user) {
        return user;
      } else {
        throw fastify.httpErrors.notFound();
      };
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const user = request.body;
      if (user) {
        return await fastify.db.users.create(user);
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
    async function (request, reply): Promise<UserEntity> {
      const id = request.params.id;
      const user = await fastify.db.users.findOne({ key: 'id', equals: id });
      const users = await fastify.db.users.findMany({ key: 'subscribedToUserIds', inArray: id })
      const newArrWithoutDeleteUser = users.map((user) => {
        user.subscribedToUserIds = user.subscribedToUserIds.filter((userId) => userId !== id);
        return user;
      });
      newArrWithoutDeleteUser.forEach(async (user) => await fastify.db.users.change(user.id, user))
      if (user) {
        return await fastify.db.users.delete(id);
      } else {
        throw fastify.httpErrors.badRequest();
      };
    }
  );

  fastify.post(
    '/:id/subscribeTo',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const newUser = request.params.id;
      const id = request.body; 
      const user = await fastify.db.users.findOne({ key: 'id', equals: id.userId });
      if (user) {
        user.subscribedToUserIds.push(newUser);
        return await fastify.db.users.change(id.userId, user);
      } else {
        throw fastify.httpErrors.badRequest();
      };
    }
  );

  fastify.post(
    '/:id/unsubscribeFrom',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const deleteSubscribeUserId = request.params.id;
      const id = request.body; 
      const user = await fastify.db.users.findOne({ key: 'id', equals: id.userId });
      if (user) {
        const userUnsubscribe = user.subscribedToUserIds.find((userId) => userId === deleteSubscribeUserId);
        if (userUnsubscribe) {
          user.subscribedToUserIds = user.subscribedToUserIds.filter((userId) => userId !== deleteSubscribeUserId);
          return await fastify.db.users.change(id.userId, user);
        } else {
          throw fastify.httpErrors.badRequest();
        }
      } else {
        throw fastify.httpErrors.badRequest();
      };
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const id = request.params.id;
      const newUser = request.body; 
      const user = await fastify.db.users.findOne({ key: 'id', equals: id });
      if (user) {
        return await fastify.db.users.change(id, newUser);
      } else {
        throw fastify.httpErrors.badRequest();
      };
    }
  );
};

export default plugin;
