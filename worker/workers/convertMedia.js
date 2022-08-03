import AMPQ from '../../rabbitmq/ampq';
import { RESEND_EMAIL_AFTER_FAILED, WORKER_NAME } from '../../server/constants';
import logger from '../../server/util/logger';
import { convertLibs } from '../../server/helpers/convertMedia';
import { convertPDFLibs } from '../../server/helpers/libreoffice';
import UserFile from '../../server/components/file/userFile.model';
import File from '../../server/components/file/file.model';

export function run() {
  logger.info('CONVERT_MEDIA WORKER IS RUNNING...');
  AMPQ.consumeData(WORKER_NAME.CONVERT_MEDIA, async (msg, channel) => {
    try {
      const data = JSON.parse(msg.content.toString());
      if (data.fileType === '.pdf') {
        const file = await convertPDFLibs(data);
        if (file) {
          if (data.type === 'userFile') {
            await UserFile.updateOne({
              _id: data._id,
            }, {
              $set: {
                pathView: file,
              }
            });
          } else {
            await File.updateOne({
              _id: data._id,
            }, {
              $set: {
                pathView: file,
              }
            });
          }
        }
      } else {
        const file = await convertLibs(data);
        if (data.type === 'userFile') {
          await UserFile.updateOne({
            _id: data._id,
          }, { $set: {
              pathView: file
            }});
        } else {
          await File.updateOne({
            _id: data._id,
          }, { $set: {
              pathView: file,
            }});
        }
      }
      return channel.ack(msg);
    } catch (error) {
      logger.error('CONVERT_MEDIA error:');
      logger.error(error);
      setTimeout(() => {
        channel.nack(msg);
      }, RESEND_EMAIL_AFTER_FAILED);
      throw error;
    }
  }, {
    noAck: false,
  });
}
