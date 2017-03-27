require('babel-polyfill');

/* eslint-disable import/first */
import fs from 'fs';
import { graphql, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { log } from 'zweer-utils';
/* eslint-enable import/first */

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
  log.debug(`statusCode: ${statusCode}`);
  log.debug(body);

  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*', // Required for CORS
    },
    body: JSON.stringify(body),
  };
}

export async function handler(event, context, done) {
  log.debug(event);

  const body = JSON.parse(event.body);

  try {
    const result = await graphql(Schema, body.query);

    log.info('Finished successfully');

    done(null, createResponse(200, result));
  } catch (err) {
    log.error('Finished with errors');
    log.debug(err);

    done(null, createResponse(err.responseStatusCode || 500, { message: err.message || 'Internal server error' }));
  }
}
