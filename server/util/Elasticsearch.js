import elasticsearch from 'elasticsearch';
import { ELASTIC_SEARCH_HOST } from '../config';
import logger from './logger';

const client = new elasticsearch.Client({
  host: ELASTIC_SEARCH_HOST,
  log: 'trace',
  apiVersion: '7.11.1', // use the same version of your Elasticsearch instance
});

export async function deployDocument(index, payload) {
  try {
    if (!await client.indices.exists({ index })) {
      await client.indices.create({ index, body: payload });
    }
    return true;
  } catch (error) {
    logger.error(`Elasticsearch deployDocument error: ${error}`);
    throw error;
  }
}

export async function deleteDocuments(index) {
  try {
    if (await client.indices.exists({ index })) {
      return await client.indices.delete({ index });
    }
    return true;
  } catch (error) {
    logger.error(`Elasticsearch deleteDocuments error: ${error}`);
    throw error;
  }
}

/**
 * Stores a typed JSON document in an index, making it searchable
 * @param {Object} params
 * @param {String} params.id
 * @param {String} params.index
 * @param {String} params.type
 * @param {Object|JSON} params.body
 * @returns {Promise<*>}
 */
export async function createIndex(params) {
  try {
    return await client.index(params);
  } catch (error) {
    logger.error(`Elasticsearch createIndex error: ${error}`);
    throw error;
  }
}

/**
 * Update parts of a document
 * @param params
 * @returns {Promise<*>}
 */
export async function updateDocument(params) {
  try {
    return await client.update(params);
  } catch (error) {
    logger.error(`Elasticsearch updateDocument error: ${error}`);
    throw error;
  }
}

/**
 * Delete a typed JSON document from a specific index based on its id.
 * @param {Object} params
 * @param {String} params.id The document ID
 * @param {String} params.index The name of the index
 * @param {String} params.type The type of the document
 * @returns {*}
 */
export async function deleteDocument(params) {
  try {
    return await client.delete(params);
  } catch (error) {
    logger.error(`Elasticsearch deleteDocument error: ${error}`);
    throw error;
  }
}

/**
 * Return documents matching a query, aggregations/facets, highlighted snippets, suggestions, and more.
 * @param {String|String[]|Boolean} params.index
 * @param {String|String[]|Boolean} params.type
 * @param {Object|JSON} params.body
 * @returns {Promise<string|*>}
 */
export async function searchDocuments(params) {
  try {
    return await client.search(params);
  } catch (error) {
    logger.error(`Elasticsearch searchDocuments error: ${error}`);
    throw error;
  }
}
