import mongoose from 'mongoose';
import { UPLOAD_GET_HOST } from '../../config';
import {FILE_SHARE_TYPE} from "../../constants";
/**
 * @swagger
 * definitions:
 *  File:
 *    type: object
 *    properties:
 *      _id:
 *        type: string
 *      title:
 *        type: string
 *      course:
 *        type: string
 *      user:
 *        type: string
 *      originalname:
 *        type: string
 *      filename:
 *        type: string
 *      mimetype:
 *        type: string
 *      path:
 *        type: string
 *      size:
 *        type: string
 *      url:
 *        type: string
 *      visibility:
 *        type: string
 *      type:
 *        type: string
 *      status:
 *        type: string
 */
const FileSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', index: true },
  originalname: { type: String, required: true },
  filename: { type: String, required: true },
  mimetype: { type: String, required: true },
  path: { type: String, required: true },
  pathView: { type: String },
  size: { type: String, required: true },
  type: { type: String, index: true },
  share: {
    type: {
      type: String,
      default: FILE_SHARE_TYPE.PRIVATE,
      enum: FILE_SHARE_TYPE,
      index: true
    },
    users: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    groups: [{ type: mongoose.Schema.ObjectId, ref: 'CourseGroup' }],
  },
  status: { type: String },
}, {
  timestamps: true,
});

FileSchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    if (ret.path) {
      ret.path = `${UPLOAD_GET_HOST}/${ret.path}`;
    }
    if (ret.pathView) {
      ret.pathView = `${UPLOAD_GET_HOST}/${ret.pathView}`;
    }
    delete ret.__v;
    // delete ret.createdAt;
    delete ret.updatedAt;
    // delete ret.user;
    delete ret.filename;
  },
});
export default mongoose.model('File', FileSchema);
