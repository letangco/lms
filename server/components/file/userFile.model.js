import mongoose from 'mongoose';
import { UPLOAD_GET_HOST } from '../../config';
import { checkExtensionFileViewBrowser } from '../../helpers/string.helper'
/**
 * @swagger
 * definitions:
 *  File:
 *    type: object
 *    properties:
 *      _id:
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
 */
const UserFileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  originalname: { type: String, required: true },
  filename: { type: String, required: true },
  mimetype: { type: String, required: true },
  path: { type: String, required: true },
  pathView: { type: String },
  size: { type: String, required: true }
}, {
  timestamps: true,
});

UserFileSchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    if (ret.path) {
      ret.path = `${UPLOAD_GET_HOST}/${ret.path}`;
    }
    if (ret.pathView) {
      ret.pathView = `${UPLOAD_GET_HOST}/${ret.pathView}`;
    } else if (checkExtensionFileViewBrowser(ret.path)) {
      ret.pathView = ret.path;
    }
    delete ret.__v;
    delete ret.updatedAt;
    delete ret.user;
    delete ret.filename;
  },
});
export default mongoose.model('UserFile', UserFileSchema);
