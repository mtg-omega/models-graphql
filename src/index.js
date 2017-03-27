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

function createResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*', // Required for CORS
    },
    body: JSON.stringify(body),
  };
}

export function handler(event, context, done) {
  log.debug(event);

  const body = JSON.parse(event.body);

  graphql(Schema, body.query)
    .then(result => done(null, createResponse(200, result)))
    .catch(error => done(null, createResponse(error.responseStatusCode || 500, { message: error.message || 'Internal server error' })));
}
