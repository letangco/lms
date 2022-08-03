import * as SessionUserService from './sessionUser.service';

export async function createSessionUser(req, res, next) {
  try {
    await SessionUserService.createSessionUser(req.auth, req.body);
    return res.json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteSessionUser(req, res, next) {
  try {
    const {
      id,
    } = req.params;
    await SessionUserService.deleteSessionUser(id, req.auth);
    return res.json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getSessionUser(req, res, next) {
  try {
    const {
      id,
    } = req.params;
    const sessionUser = await SessionUserService.getSessionUser(req.auth, id);
    return res.json({
      success: true,
      payload: sessionUser,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getSessionUsers(req, res, next) {
  try {
    const {
      page,
      rowPerPage,
    } = req.query;
    const data = await SessionUserService.getSessionUsers(req.params.id, {
      _page: page,
      rowPerPage,
    });
    return res.json({
      success: true,
      payload: data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateSessionUser(req, res, next) {
  try {
    const sessionUser = await SessionUserService.updateSessionUser(req.params.id, req.body);
    return res.json({
      success: true,
      payload: sessionUser,
    });
  } catch (error) {
    return next(error);
  }
}

export async function bulkUpdateSessionUser(req, res, next) {
  try {
    await SessionUserService.bulkUpdateSessionUser(req.body.ids, req.body);
    return res.json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
}

export async function registrySessionUser(req, res, next) {
  try {
    await SessionUserService.registrySessionUser(req.auth, req.body);
    return res.json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
}

export async function removeRegistrySessionUser(req, res, next) {
  try {
    const {
      id,
    } = req.params;
    await SessionUserService.removeRegistrySessionUser(req.auth, id);
    return res.json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
}
