import jwt from 'jsonwebtoken';
import APIError from '../util/APIError';
import { USER_JWT_SECRET_KEY } from '../config';
import User from '../components/user/user.model';
import { USER_STATUS, AUTH_ERRORS } from '../constants';
import { checkUserPermission } from '../components/userType/userType.service';
import logger from '../util/logger';

/**
 * Validate user account
 * @param checkPermission
 * @returns {function(*, *, *)}
 */
export function isAuthorized(checkPermission) {
  return async (req, res, next) => {
    try {
      const authorization = req.header('Authorization');
      const role = req.header('Role');
      if (typeof authorization !== 'string') {
        return next(new APIError(401, AUTH_ERRORS.UNAUTHORIZED));
      }
      const authorizationArray = authorization.split(' ');
      if (authorizationArray[0] === 'Bearer') {
        const token = authorizationArray[1];
        let userData;
        try {
          userData = jwt.verify(token, USER_JWT_SECRET_KEY);
        } catch (error) {
          return next(new APIError(401, AUTH_ERRORS.UNAUTHORIZED));
        }
        req.auth = await User.findOne({ _id: userData._id }, '_id type fullName firstName lastName email status forgotPasswordInfo');
        if (!req.auth) {
          return next(new APIError(401, AUTH_ERRORS.UNAUTHORIZED));
        }
        if (req.auth.status !== USER_STATUS.ACTIVE) {
          return next(new APIError(401, AUTH_ERRORS.UNAUTHORIZED));
        }
        if (checkPermission) {
          const path = `${req.baseUrl}${req.route.path}`;
          let route = path.split('/').splice(2).filter(item => !!item);
          if (route.length > 1) {
            route = route.join('/');
          } else {
            route = route[0];
          }
          const isValid = await checkUserPermission(req.auth.type, req.method, route);
          if (!isValid) {
            return next(new APIError(401, AUTH_ERRORS.PERMISSION_DENIED));
          }
        }
        req.role = role;
        return next();
      }
      return next(new APIError(401, AUTH_ERRORS.UNAUTHORIZED));
    } catch (error) {
      logger.error(`User validation error: ${error}`);
      return next(new APIError(500, 'Internal server error'));
    }
  };
}
