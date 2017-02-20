import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
} from 'graphql';

import {
  GraphQLUUID,
} from 'graphql-custom-types';


export const Single = new GraphQLObjectType({
  name: 'single',
  description: 'A single of an edition',
  fields: () => ({
    id: { type: GraphQLUUID },
    name: {
      type: GraphQLString,
      resolve(single) {
        if (single.i18n) {
          return single.i18n[0].name;
        }

        return null;
      },
    },
  }),
});

export default {
  cards: {
    type: new GraphQLList(Single),
  },

  card: {
    type: Single,
  },
};
