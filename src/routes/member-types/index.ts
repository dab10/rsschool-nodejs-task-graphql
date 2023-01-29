import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { changeMemberTypeBodySchema } from './schema';
import type { MemberTypeEntity } from '../../utils/DB/entities/DBMemberTypes';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<MemberTypeEntity[]> {
    const memberTypes = await fastify.db.memberTypes.findMany();
    if (memberTypes) {
      return memberTypes
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
    async function (request, reply): Promise<MemberTypeEntity> {
      const id = request.params.id;
      const memberType = await fastify.db.memberTypes.findOne({ key: 'id', equals: id });

      if (memberType) {
        return memberType;
      } else {
        throw fastify.httpErrors.notFound();
      };
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeMemberTypeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      const id = request.params.id;
      const newMemberType = request.body; 
      const memberType = await fastify.db.memberTypes.findOne({ key: 'id', equals: id });
      if (memberType) {
        return await fastify.db.memberTypes.change(id, newMemberType);
      } else {
        throw fastify.httpErrors.badRequest();
      };
    }
  );
};

export default plugin;
