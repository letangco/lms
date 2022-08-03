import mongoose from 'mongoose';
import { DISCUSSION_STATUS, SOCKET_DISCUSSION_EVENTS } from '../../constants';
import DiscussionNamespace from '../../socket/discussion/discussion.namespace';

/**
 * @swagger
 * definitions:
 *  Discussion Comment:
 *    type: object
 *    properties:
 *      _id:
 *        type: string
 *      creator:
 *        type: string
 *      message:
 *        type: string
 *      parent:
 *        type: string
 *      status:
 *        type: string
 *      files:
 *        type: array
 *        items:
 *          type: object
 *          properties:
 *            originalname:
 *              type: string
 *            filename:
 *              type: string
 *            path:
 *              type: string
 *            size:
 *              type: number
 *            url:
 *              type: string
 *            status:
 *              type: number
 */
const DiscussionCommentSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  message: { type: String, max: 10000 },
  discussion: { type: mongoose.Schema.Types.ObjectId, ref: 'Discussion', index: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'DiscussionComment', index: true },
  files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserFile' }],
  status: { type: String, enum: Object.values(DISCUSSION_STATUS), default: DISCUSSION_STATUS.ACTIVE, index: true }
}, {
  timestamps: true,
});

DiscussionCommentSchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    delete ret.__v;
    delete ret.status;
    delete ret.updatedAt;
  },
});

DiscussionCommentSchema.post('save', async (discussion, next) => {
  discussion = await discussion.populate([
    {
      path: 'files',
      select: 'originalname filename mimetype path pathView size',
    },
    {
      path: 'creator',
      select: 'fullName avatar',
    },
  ]).execPopulate();
  discussion = discussion.toJSON();
  DiscussionNamespace.emitToRoom(discussion.discussion, SOCKET_DISCUSSION_EVENTS.DISCUSSION, discussion);
  next();
});

DiscussionCommentSchema.post('updateOne', async function (updated, next) {
  const conditions = this._conditions;
  const discussion = await this.model.findOne(conditions).populate([
    {
      path: 'files',
      select: 'originalname filename mimetype path pathView size',
    },
    {
      path: 'creator',
      select: 'fullName avatar',
    },
  ]);
  if (discussion) {
    switch (discussion.status) {
      case DISCUSSION_STATUS.ACTIVE:
        DiscussionNamespace.emitToRoom(discussion.discussion, SOCKET_DISCUSSION_EVENTS.DISCUSSION_UPDATED, discussion);
        break;
      case DISCUSSION_STATUS.DELETED:
        DiscussionNamespace.emitToRoom(discussion.discussion, SOCKET_DISCUSSION_EVENTS.DISCUSSION_DELETED, discussion);
        break;
      default:
    }
  }
  return next();
});

export default mongoose.model('DiscussionComment', DiscussionCommentSchema);
