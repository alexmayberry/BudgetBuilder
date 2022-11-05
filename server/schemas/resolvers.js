const { AuthenticationError } = require('apollo-server-express');
const { User, Brief, Project } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    // users: async () => {
    //   return User.find().select("-password");
    // },
    user: async (parent, { username }) => {
      return User.findOne({ username }).select("-password");
    },
    me: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You need to be logged in!');
      }

      return User.findOne({ _id: context.user._id })
              .select("-password")
              .populate('timeline');
    },
    briefs: async () => {
      return await Brief.find({}).populate('user').populate('project');
    },
    // LUNCH BREAK STOPPING POINT
    brief: async (parent, args, context) => {
      return await Brief.findById( args.id ).populate('user').populate('project');
    }
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password }).select("-password");
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('No user found with this email address');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);

      return { token, user };
    },
    // addTimeline: async (parent, { entry }, { user }) => {

    //   if(!user) {
    //     throw new AuthenticationError('Must be logged in to create timeline entries');
    //   }

    //   const timeline = await Timeline.create({ ...entry });

    //   await User.findOneAndUpdate({ _id: user._id }, { $addToSet: { timeline: timeline._id } });

    //   return timeline;

    // }
  },
};

module.exports = resolvers;
