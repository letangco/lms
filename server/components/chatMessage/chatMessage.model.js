import mongoose from 'mongoose';
import logger from '../../util/logger';
import { CHAT_MESSAGE_STATUS, CHAT_MESSAGE_TYPE } from '../../constants';
import { emitMessageToGroup } from '../chatGroup/chatGroup.service';
import { UPLOAD_GET_HOST } from '../../config';

/**
 * @swagger
 * definitions:
 *  ChatMessage:
 *    type: object
 *    properties:
 *      _id:
 *        type: string
 *      sender:
 *        type: string
 *      group:
 *        type: string
 *      type:
 *        type: string
 *      content:
 *        type: object
 *        properties:
 *          text:
 *            type: string
 *          files:
 *            type: array
 *            items:
 *              type: object
 *              properties:
 *                originalname:
 *                  type: string
 *                filename:
 *                  type: string
 *                mimetype:
 *                  type: string
 *                path:
 *                  type: string
 *                size:
 *                  type: number
 *                url:
 *                  type: string
 *      status:
 *        type: string
 */
const ChatMessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatGroup', required: true },
  type: {
    type: String,
    enum: Object.values(CHAT_MESSAGE_TYPE),
    default: CHAT_MESSAGE_TYPE.MESSAGE,
    required: true,
  },
  content: {
    text: { type: String },
    files: {
      type: [{
        originalname: { type: String },
        filename: { type: String },
        mimetype: { type: String },
        path: { type: String },
        size: { type: Number },
        url: { type: String },
      }],
      // eslint-disable-next-line no-undefined
      default: undefined,
    },
  },
  status: { type: String, enum: Object.values(CHAT_MESSAGE_STATUS), default: CHAT_MESSAGE_STATUS.ACTIVE, index: true },
}, {
  timestamps: true,
});

ChatMessageSchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    delete ret.__v;
    delete ret.updatedAt;
    delete ret.status;
    ret?.content?.files?.forEach((file) => {
      if (file?.url) {
        file.url = `${UPLOAD_GET_HOST}/${file.url}`;
      }
      delete file?.path;
    });
  },
});

ChatMessageSchema.post('save', async (message, next) => {
  message = await message.populate({
    path: 'sender',
    select: 'fullName avatar',
  }).execPopulate();
  message = message.toJSON();
  emitMessageToGroup(message.group, message).catch((error) => {
    logger.error('ChatMessageSchema emitMessageToGroup error:');
    logger.error(error);
  });
  next();
});

export default mongoose.model('ChatMessage', ChatMessageSchema);
