import * as UserRoleService from './userRole.service';

export async function getUserRoles(req, res, next) {
  try {
    const userRoles = await UserRoleService.getUserRoles();
    return res.json({
      success: true,
      payload: userRoles,
    });
  } catch (error) {
    return next(error);
  }
}
