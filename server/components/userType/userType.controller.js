import * as UserTypeService from './userType.service';

export async function createUserType(req, res, next) {
  try {
    const userType = await UserTypeService.createUserType(req.body);
    return res.json({
      success: true,
      payload: userType,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateUserType(req, res, next) {
  try {
    const userType = await UserTypeService.updateUserType(req.auth, req.params.id, req.body);
    return res.json({
      success: true,
      payload: userType,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteUserType(req, res, next) {
  try {
    await UserTypeService.deleteUserType(req.params.id);
    return res.json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getUserType(req, res, next) {
  try {
    const data = await UserTypeService.getUserType(req.params.id);
    return res.json({
      success: true,
      payload: data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getUserTypes(req, res, next) {
  try {
    const {
      page,
      rowPerPage,
      textSearch,
    } = req.query;
    const data = await UserTypeService.getUserTypes(page, rowPerPage, textSearch);
    return res.json({
      success: true,
      payload: data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getUserTypeList(req, res, next) {
  try {
    const {
      firstId,
      lastId,
      rowPerPage,
      textSearch,
    } = req.query;
    const data = await UserTypeService.getUserTypeList({
      rowPerPage,
      firstId,
      lastId,
      textSearch,
    });
    return res.json({
      success: true,
      payload: data,
    });
  } catch (error) {
    return next(error);
  }
}
