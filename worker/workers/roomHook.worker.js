import AMPQ from '../../rabbitmq/ampq';
import logger from '../../server/util/logger';
import * as RoomService from '../../server/components/room/room.service';
import { RESTART_ROOM_HOOK_AFTER, WORKER_NAME } from '../../server/constants';

export function run() {
  logger.info('ROOM_HOOK WORKER IS RUNNING...');
  AMPQ.consumeData(WORKER_NAME.ROOM_HOOK, async (msg, channel) => {
    try {
      const data = JSON.parse(msg.content.toString());
      await RoomService.callRoomHook(data);
      return channel.ack(msg);
    } catch (error) {
      logger.error('WORKER_NAME.ROOM_HOOK error:');
      logger.error(msg.content.toString());
      logger.error(error);
      setTimeout(() => {
        channel.nack(msg);
      }, RESTART_ROOM_HOOK_AFTER);
      return true;
    }
  }, {
    noAck: false,
  });

  AMPQ.consumeData(WORKER_NAME.ROOM_RECORDED_HOOK, async (msg, channel) => {
    try {
      const data = JSON.parse(msg.content.toString());
      await RoomService.callRoomRecordedHook(data);
      return channel.ack(msg);
    } catch (error) {
      logger.error('WORKER_NAME.ROOM_RECORDED_HOOK error:');
      logger.error(msg.content.toString());
      logger.error(error);
      setTimeout(() => {
        channel.nack(msg);
      }, RESTART_ROOM_HOOK_AFTER);
      return true;
    }
  }, {
    noAck: false,
  });
}
