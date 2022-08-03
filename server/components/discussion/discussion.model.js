import mongoose from 'mongoose';
import { DISCUSSION_STATUS } from '../../constants';

/**
 * @swagger
 * definitions:
 *  Discussion:
 *    type: object
 *    properties:
 *      _id:
 *        type: string
 *      creator:
 *        type: string
 *      name:
 *        type: string
 *      message:
 *        type: string
 *      group:
 *        type: string
 *      course:
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
const DiscussionSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  name: { type: String, max: 100, index: true },
  message: { type: String, max: 10000 },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', index: true },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', index: true },
  files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserFile' }],
  status: { type: String, enum: Object.values(DISCUSSION_STATUS), default: DISCUSSION_STATUS.ACTIVE, index: true }
}, {
  timestamps: true,
});

DiscussionSchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    delete ret.__v;
    delete ret.status;
    delete ret.updatedAt;
  },
});

export default mongoose.model('Discussion', DiscussionSchema);
