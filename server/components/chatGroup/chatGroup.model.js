import mongoose from 'mongoose';
import { CHAT_GROUP_STATUS, CHAT_GROUP_TYPE } from '../../constants';

/**
 * @swagger
 * definitions:
 *  ChatGroup:
 *    type: object
 *    properties:
 *      _id:
 *        type: string
 *      name:
 *        type: string
 *      course:
 *        type: objectId
 *        description: Use for case course chat group
 *      members:
 *        type: array
 *        items:
 *          type: object
 *          properties:
 *            _id:
 *              type: string
 *              description: The user _id
 *            unread:
 *              type: number
 *              description: The messages unread of this group
 *      type:
 *        type: string
 *      status:
 *        type: string
 */
const ChatGroupSchema = new mongoose.Schema({
  name: { type: String, index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', index: true },
  members: [{
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    unread: { type: Number, default: 0 },
  }],
  type: { type: String, enum: Object.values(CHAT_GROUP_TYPE) },
  status: { type: String, enum: Object.values(CHAT_GROUP_STATUS), default: CHAT_GROUP_STATUS.ACTIVE, index: true },
}, {
  timestamps: true,
});

ChatGroupSchema.index({ 'members._id': 1 });

ChatGroupSchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
  },
});

export default mongoose.model('ChatGroup', ChatGroupSchema);
