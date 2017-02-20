import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLNonNull,
} from 'graphql';
import { Edition as EditionSql, EditionI18N, SingleI18N } from 'mtg-omega-models-sql';

import { Single } from './single';

export const Edition = new GraphQLObjectType({
  name: 'edition',
  description: 'An edition of singles',
  fields: () => ({
    code: { type: GraphQLString },
    name: {
      type: GraphQLString,
      resolve(edition) {
        if (edition.i18n) {
          return edition.i18n[0].name;
        }

        return null;
      },
    },

    singles: {
      type: new GraphQLList(Single),
      resolve(edition) {
        const query = { include: [] };

        if (edition.i18n.length === 1) {
          query.include.push({
            model: SingleI18N,
            as: 'i18n',
            where: { language: edition.i18n[0].language },
          });
        }

        return edition.getSingles(query);
      },
    },
  }),
});

export default {
  editions: {
    type: new GraphQLList(Edition),
    args: {
      code: { type: GraphQLString },
      language: { type: GraphQLString },
    },
    resolve(_, { code, language }) {
      const query = {
        where: {},
        include: [],
      };

      if (code) {
        query.where.code = code;
      }

      if (language) {
        query.include.push({
          model: EditionI18N,
          as: 'i18n',
          where: { language },
        });
      }

      return EditionSql.findAll(query);
    },
  },

  edition: {
    type: Edition,
    args: {
      code: { type: new GraphQLNonNull(GraphQLString) },
      language: { type: GraphQLString },
    },
    resolve(_, { code, language }) {
      const query = {
        where: { code },
        include: [],
      };

      if (language) {
        query.include.push({
          model: EditionI18N,
          as: 'i18n',
          where: { language },
        });
      }

      return EditionSql.findOne(query);
    },
  },
};
