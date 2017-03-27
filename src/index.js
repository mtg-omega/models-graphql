import fs from 'fs';
import { graphql, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { log } from 'zweer-utils';

const queryFields = {};

fs.readdirSync(__dirname)
  .filter(filename => filename.substr(-3) === '.js' && filename !== 'index.js')
  .forEach((filename) => {
    const tmpFields = require(`./${filename}`); // eslint-disable-line global-require, import/no-dynamic-require

    Object.assign(queryFields, tmpFields.default);
  });

const Query = new GraphQLObjectType({
  name: 'MtgOmegaSchema',
  description: 'The root of the Mtg Omega schema',
  fields: queryFields,
});

const Schema = new GraphQLSchema({
  query: Query,
});

export default Schema;

export function handler(event, context, done) {
  log.debug(event);

  let query = event.query;

  // patch to allow queries from GraphiQL
  // like the initial introspectionQuery
  if (event.query && event.query.hasOwnProperty('query')) {
    query = event.query.query.replace('\n', ' ', 'g');
  }

  graphql(Schema, query)
    .then((result) => {
      if (result.errors) {
        log.error('Error while executing the graphql query');
        log.info(result.errors);

        done(result.errors);
        return;
      }

      done(null, result.data);
    });
}
