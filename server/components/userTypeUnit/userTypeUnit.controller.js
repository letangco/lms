import * as UserTypeUnitService from './userTypeUnit.service';

export async function createUserTypeUnit(req, res, next) {
  try {
    const userTypeUnit = await UserTypeUnitService.createUserTypeUnit(req.body);
    return res.json({
      success: true,
      payload: userTypeUnit,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateUserTypeUnit(req, res, next) {
  try {
    const userTypeUnit = await UserTypeUnitService.updateUserTypeUnit(req.params.id, req.body);
    return res.json({
      success: true,
      payload: userTypeUnit,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteUserTypeUnit(req, res, next) {
  try {
    await UserTypeUnitService.deleteUserTypeUnit(req.params.id);
    return res.json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getUserTypeUnits(req, res, next) {
  try {
    const data = await UserTypeUnitService.getUserTypeUnits();
    return res.json({
      success: true,
      payload: data,
    });
  } catch (error) {
    return next(error);
  }
}
