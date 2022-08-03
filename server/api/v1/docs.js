import swaggerJSDoc from 'swagger-jsdoc';
import { API_DOCS_HOST } from '../../config';

const swaggerDefinition = {
  info: {
    title: 'Tesse API Docs V1',
    version: '1.0.0',
    description: 'Tesse API Docs V1',
  },
  host: API_DOCS_HOST,
  basePath: '/v1',
  produces: ['application/json'],
  consumes: ['application/json'],
  securityDefinitions: {
    bearer: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
    },
    role: {
      type: 'apiKey',
      name: 'Role',
      in: 'header',
    },
  },
  security: [{ bearer: [] }, { role: [] }],
};

const options = {
  swaggerDefinition,
  apis: [
    'server/components/**/*.route.js',
    'server/components/**/*.model.js',
    'server/api/validatorErrorHandler.js',
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;

