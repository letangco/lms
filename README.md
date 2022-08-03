## Set up server: 
      
### 1. Install docker:
  - [For desktop](https://www.docker.com/products/docker-desktop)
  - [For Ubuntu server](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-16-04)
    
### 2. [Install docker-compose](https://www.digitalocean.com/community/tutorials/how-to-install-docker-compose-on-ubuntu-16-04) 
### 3. Start docker:
  - Config:
   + Config docker:
     Copy file docker-compose.template.yml to docker-compose.yml and update to your config
   + Config mongo:
     Extract file mongo/secrets.zip.
     Config mongo authentication.
   + Config rabbitmq:
     Copy file rabbitmq_management.template.conf to rabbitmq_management.conf and update to your config
   + Config env:
     Copy file sample.env to .env and update to your config
   + Start docker:
       ````bash
       docker-compose up -d
       ````
   - Enter docker:
       ````bash
       docker exec -it xroom-backend bash
       ````
   - Run backend development:
      ````bash
      npm start
      ````

### 4. Run source:
  - Run main service and worker service:
    ````bash
    # Dev mode
    npm run dev
    npm run dev:worker
    # Production mode
    npm run prod
    npm run worker
    ````
### 5. Docs page:
[API docs](http://localhost:4001/v1/api-docs)

### 6. Requirement:

 - Every model must have a swagger definitions
 ````js
import mongoose from 'mongoose';

/**
 * @swagger
 * definitions:
 *  User:
 *    type: object
 *    properties:
 *      id:
 *        type: string
 *      username:
 *        type: string
 */
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
});

export default mongoose.model('User', UserSchema);
````
 - Every route must have a swagger document definitions
 ````js
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get users
 *     tags:
 *       - User
 *     responses:
 *       200:
 *         description: Get users
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               $ref: '#/definitions/User'
 *           example: {
 *             "success": true,
 *             "payload": {
 *               "id": "5c812eef0a60504e4c0cf84b",
 *               "username": "John Smith"
 *             }
 *           }
 *       404:
 *         description: When the User not found
 *       500:
 *         description: When got server exception
 */
router.route('/')
  .get(UserController.getUser);
````
 - Every service function need return an APIError with statusCode and message:
   We have an custom Error - APIError: it ship the statusCode inside to easy handle with Express.
   You need to import it from **server/util/APIError.js**
   
   Example:
 ````js
   import APIError from 'server/util/APIError.js';
   // ...
   const error = new APIError(404, 'User not found');
 ````
 
 - Each controller function need return next(error) on catch,
 it will forward the Error from service to Express Error handle
 
 ````js
export async function getUser(req, res, next) {
  try {
    // Do something
  } catch (error) {
    logger.error('getUser error:');
    logger.error(error);
    
    /** FOCUS HERE **/
    return next(error);
  }
}
 ````
 - Success response structure:
 
 ````js
  const successDataResponse = {
    success: true,
    payload: {}, // Any data here
  }
 ````
  - Fail response structure:
  
  ````js
   const failDataResponse = {
     success: false,
     message: 'Internal server error', // Please don't response detail error to client
   }
  ````
 
 - Must use logger for important log:
 
 ````js
  import logger from 'server/util/logger.js';
  // ...
  logger.debug('Debug');
  logger.info('Info');
  logger.error(Error('An error'));
  logger.error(new APIError(500, 'An error with statusCode'));
 ````
  - On catch block must use logger:
  
  ````js
   try {
     // Do something
   } catch (error) {
     logger.error('error');
     logger.error(error);
     throw error;
   }
  ````