import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createProfileBodySchema, changeProfileBodySchema } from './schema';
import type { ProfileEntity } from '../../utils/DB/entities/DBProfiles';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<ProfileEntity[]> {
    const profiles = await fastify.db.profiles.findMany();
    if (profiles) {
      return profiles
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
    async function (request, reply): Promise<ProfileEntity> {
      const id = request.params.id;
      const profile = await fastify.db.profiles.findOne({ key: 'id', equals: id });
      if (profile) {
        return profile;
      } else {
        throw fastify.httpErrors.notFound();
      };
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createProfileBodySchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const profile = request.body;
      const userProfile = await fastify.db.profiles.findOne({ key: 'userId', equals: profile.userId });
      if (userProfile) {
        throw fastify.httpErrors.badRequest();
      }
      if (profile && (profile.memberTypeId.includes('basic') || profile.memberTypeId.includes('business'))) {
        return await fastify.db.profiles.create(profile);
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
    async function (request, reply): Promise<ProfileEntity> {
      const id = request.params.id;
      const profile = await fastify.db.profiles.findOne({ key: 'id', equals: id });
      if (profile) {
        return await fastify.db.profiles.delete(id);
      } else {
        throw fastify.httpErrors.badRequest();
      };
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeProfileBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const id = request.params.id;
      const newProfile = request.body; 
      const profile = await fastify.db.profiles.findOne({ key: 'id', equals: id });

      if (profile) {
        return await fastify.db.profiles.change(id, newProfile);
      } else {
        throw fastify.httpErrors.badRequest();
      };
    }
  );
};

export default plugin;
