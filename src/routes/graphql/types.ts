import {
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

const userTypeBasic = {
  id: { type: GraphQLID },
  firstName: { type: GraphQLString },
  lastName: { type: GraphQLString },
  email: { type: GraphQLString },
  subscribedToUserIds: { type: new GraphQLList(GraphQLID) },
};

// const userType = new GraphQLObjectType({
//   name: 'User',
//   fields: userTypeBasic,
// });

const profileTypeBasic = {
  id: { type: GraphQLID },
  avatar: { type: GraphQLString },
  sex: { type: GraphQLString },
  birthday: { type: GraphQLInt },
  country: { type: GraphQLString },
  street: { type: GraphQLString },
  city: { type: GraphQLString },
  memberTypeId: { type: GraphQLString },
  userId: { type: GraphQLID },
};

const profileType = new GraphQLObjectType({
  name: 'Profile',
  fields: profileTypeBasic,
});

const postTypeBasic = {
  id: { type: GraphQLID },
  title: { type: GraphQLString },
  content: { type: GraphQLString },
  userId: { type: GraphQLID },
};

const postType = new GraphQLObjectType({
  name: 'Post',
  fields: postTypeBasic,
});

const memberTypeTypeBasic = {
  id: { type: GraphQLString },
  discount: { type: GraphQLInt },
  monthPostsLimit: { type: GraphQLInt },
};

const memberTypeType = new GraphQLObjectType({
  name: 'MemberType',
  fields: memberTypeTypeBasic,
});

export const userDataType = new GraphQLObjectType({
  name: 'User',
  fields: {
    ...userTypeBasic,
    profile: {
      type: profileType,
      resolve: async (parent, _, fastify) => {
        const profile = await fastify.db.profiles.findOne({ key: 'id', equals: parent.id });
        if (profile) {
          return profile;
        } else {
          throw fastify.httpErrors.notFound();
        };
      },
    },
    posts: {
      type: new GraphQLList(postType),
      resolve: async (parent, _, fastify) => {
        const posts = await fastify.db.posts.findMany({ key: 'id', equals: parent.id });
  
        if (!posts.length) {
          throw fastify.httpErrors.notFound();
        } else {
          return posts;
        };
      },
    },
    memberType: {
      type: memberTypeType,
      resolve: async (parent, _, fastify) => {
        const memberType = await fastify.db.memberTypes.findOne({ key: 'id', equals: parent.profile.id });
  
        if (memberType) {
          return memberType;
        } else {
          throw fastify.httpErrors.notFound();
        };
      },
    },
  },
});
