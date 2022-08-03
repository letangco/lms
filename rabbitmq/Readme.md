## RabbitMQ usage
#### 1. Create queue:
````javascript
import { createQueue } from '../rabbitmq';
import logger from '../server/util/logger';
// .....
createQueue().catch((error) => {
  logger.error('AMPQ: createQueue failure:');
  logger.error(error);
});
````
#### 2. Create worker:
````javascript
import { createWorkers } from '../worker/workers/index';
import logger from '../server/util/logger';
// .....
createWorkers().then(() => {
  logger.info('Worker is running');
}).catch((error) => {
  logger.error('Worker start failed:');
  logger.error(error);
});
````
