import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  USER_BIO_NAME_MAX_LENGTH, USER_EMAIL_MAX_LENGTH, USER_FIRST_NAME_MAX_LENGTH,
  USER_JWT_DEFAULT_EXPIRE_DURATION, USER_LAST_NAME_MAX_LENGTH, USER_STATUS, USERNAME_MAX_LENGTH,
} from '../../constants';
import { USER_JWT_SECRET_KEY } from '../../config';
import { getTimezoneInfo } from '../timezone/timezone.service';
import { getImageSize } from '../../helpers/resize';
/**
 * @swagger
 * definitions:
 *  User:
 *    type: object
 *    properties:
 *      _id:
 *        type: string
 *      email:
 *        type: string
 *      username:
 *        type: string
 *      firstName:
 *        type: string
 *      lastName:
 *        type: string
 *      fullName:
 *        type: string
 *      bio:
 *        type: string
 *      avatar:
 *        type: string
 *      timezone:
 *        type: string
 *      language:
 *        type: string
 *      type:
 *        type: string
 *      status:
 *        type: string
 *      points:
 *        type: number
 *      online:
 *        type: boolean
 *      unreadMessage:
 *        type: number
 */
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    max: USER_EMAIL_MAX_LENGTH,
    index: true,
  },
  username: { type: String, max: USERNAME_MAX_LENGTH },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // When delete permanently
  oldEmail: { type: String, max: USER_EMAIL_MAX_LENGTH },
  oldUsername: { type: String, max: USERNAME_MAX_LENGTH },
  firstName: { type: String, max: USER_FIRST_NAME_MAX_LENGTH },
  lastName: { type: String, max: USER_LAST_NAME_MAX_LENGTH },
  fullName: { type: String, index: true },
  password: { type: String, required: true },
  bio: { type: String, max: USER_BIO_NAME_MAX_LENGTH },
  avatar: { type: String },
  timezone: { type: String },
  language: { type: mongoose.Schema.Types.ObjectId, ref: 'Language' },
  type: { type: mongoose.Schema.Types.ObjectId, ref: 'UserType', required: true },
  status: { type: String, enum: Object.values(USER_STATUS), default: USER_STATUS.ACTIVE, index: true },
  forgotPasswordInfo: {
    expiredTime: { type: Number },
    email: { type: String },
  },
  points: { type: Number, default: 0 },
  online: { type: Boolean, default: false },
  unreadMessage: { type: Number, default: 0 },
  lastLogin: { type: Number, default: 0, index: true },
}, {
  timestamps: true,
});

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.signJWT = function (expiresIn) {
  return jwt.sign({
    _id: this._id,
    roles: this.roles,
  }, USER_JWT_SECRET_KEY, {
    expiresIn: expiresIn || USER_JWT_DEFAULT_EXPIRE_DURATION,
  });
};

UserSchema.pre('save', function (next) {
  if (typeof this.email === 'string') {
    this.email = this.email.toLowerCase();
  }

  this.fullName = (`${this?.firstName} ${this?.lastName}`).trim();
  return next();
});

UserSchema.pre('updateOne', function (next) {
  const updateFields = this?._update?.$set;
  if (typeof updateFields?.email === 'string') {
    this.set({ email: updateFields?.email.toLowerCase() });
  }
  let fullName = '';
  if (updateFields?.firstName) {
    fullName = updateFields.firstName;
  }
  if (updateFields?.lastName) {
    fullName += ` ${updateFields.lastName}`;
  }
  if (fullName) {
    this.set({ fullName: fullName.trim() });
  }
  return next();
});

UserSchema.set('toJSON', {
  transform(doc, ret, options) { // eslint-disable-line no-unused-vars
    if (!ret.fullName) {
      ret.fullName = (`${ret.firstName} ${ret.lastName}`).trim();
    }
    if (ret.avatar) {
      ret.avatar = getImageSize(ret.avatar);
    }
    if (ret.timezone) {
      ret.timezone = getTimezoneInfo(ret.timezone);
    }
    if (ret.type?.roles) {
      ret.roles = ret.type.roles;
    }
    delete ret.__v;
    delete ret.password;
    delete ret.updatedAt;
  },
});

export default mongoose.model('User', UserSchema);
