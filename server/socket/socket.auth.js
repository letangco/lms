import jwt from 'jsonwebtoken';
import User from '../components/user/user.model';
import { USER_JWT_SECRET_KEY } from '../config';
import { SOCKET_ERROR } from '../constants';

/**
 * Check user Authorization
 * @param token
 * @returns {Function}
 */
export async function isAuthorized(token) {
  if (typeof token !== 'string') {
    return Error(SOCKET_ERROR.UNAUTHORIZED);
  }
  const authorizationArray = token.split(' ');
  if (authorizationArray[0] === 'Bearer') {
    const jwtToken = authorizationArray[1];
    let userData;
    try {
      userData = jwt.verify(jwtToken, USER_JWT_SECRET_KEY);
      if (!userData) {
        return Error(SOCKET_ERROR.UNAUTHORIZED);
      }
    } catch (error) {
      return Error(SOCKET_ERROR.UNAUTHORIZED);
    }
    try {
      const user = await User.findOne({ _id: userData._id }, '_id type fullName firstName lastName email status');
      if (!user) {
        return Error(SOCKET_ERROR.UNAUTHORIZED);
      }
      return user;
    } catch (error) {
      return Error(SOCKET_ERROR.UNAUTHORIZED);
    }
  }
  return Error(SOCKET_ERROR.UNAUTHORIZED);
}
