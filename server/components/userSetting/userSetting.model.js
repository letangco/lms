import mongoose from 'mongoose';
import { USER_SETTING_STATUS } from '../../constants';
import { getImageSize } from '../../helpers/resize';

/**
 * @swagger
 * definitions:
 *  UserSetting:
 *    type: object
 *    properties:
 *      _id:
 *        type: string
 *      key:
 *        type: string
 *      value:
 *        type: string
 *      user:
 *        type: string
 *      status:
 *        type: string
 */
const UserSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, index: true },
  value: { type: 'Mixed', index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: Object.values(USER_SETTING_STATUS), default: USER_SETTING_STATUS.ACTIVE, index: true },
}, {
  timestamps: true,
});

UserSettingSchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    delete ret._id;
    delete ret.__v;
    delete ret.user;
    delete ret.status;
    delete ret.createdAt;
    delete ret.updatedAt;
    if (['logo', 'favicon', 'banner'].indexOf(ret.key) !== -1) {
      ret.value = getImageSize(ret.value);
    }
  },
});

export default mongoose.model('UserSetting', UserSettingSchema);
