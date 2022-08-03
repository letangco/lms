import mongoose from 'mongoose';
import { COURSE_STATUS } from '../../constants';
import { getImageSize } from '../../helpers/resize';

/**
 * @swagger
 * definitions:
 *  Course:
 *    type: object
 *    properties:
 *      _id:
 *        type: string
 *      name:
 *        type: string
 *      category:
 *        type: string
 *      description:
 *        type: string
 *      thumbnail:
 *        type: string
 *      creator:
 *        type: string
 *      teachingLanguage:
 *        type: string
 *      code:
 *        type: string
 *      price:
 *        type: string
 *      videoIntro:
 *        type: string
 *      parent:
 *        type: string
 *      rulesAndPath:
 *        type: objectId
 *      status:
 *        type: string
 */
const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  description: { type: String },
  thumbnail: { type: String },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teachingLanguage: { type: mongoose.Schema.Types.ObjectId, ref: 'TeachingLanguage' },
  code: { type: String, index: true },
  oldCode: { type: String },
  price: { type: Number },
  videoIntro: { type: String },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', index: true },
  rulesAndPath: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseRulesAndPath' },
  status: { type: String, enum: Object.values(COURSE_STATUS), default: COURSE_STATUS.ACTIVE, index: true },
}, {
  timestamps: true,
});

CourseSchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    delete ret.__v;
    delete ret.createdAt;
    if (ret.thumbnail) {
      ret.thumbnail = getImageSize(ret.thumbnail);
    }
  },
});

export default mongoose.model('Course', CourseSchema);
