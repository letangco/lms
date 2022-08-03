import * as GroupService from './courseGroup.service';

export async function createGroup(req, res, next) {
  try {
    const group = await GroupService.createGroup(req.auth, req.body);
    return res.json({
      success: true,
      payload: group,
    });
  } catch (error) {
    return next(error);
  }
}

export async function createUserGroup(req, res, next) {
  try {
    const group = await GroupService.createUserGroup(req.auth, req.body);
    return res.json({
      success: true,
      payload: group,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getGroups(req, res, next) {
  try {
    const {
      course,
      status,
      page,
      rowPerPage,
      textSearch
    } = req.query;
    const groups = await GroupService.getGroups(course, status, page, rowPerPage, textSearch);
    return res.json({
      success: true,
      payload: groups,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getUserGroups(req, res, next) {
  try {
    const groups = await GroupService.getUserGroups(req.query);
    return res.json({
      success: true,
      payload: groups,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getGroup(req, res, next) {
  try {
    const group = await GroupService.getGroup(req.params.id);
    return res.json({
      success: true,
      payload: group,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteGroup(req, res, next) {
  try {
    const {
      id,
    } = req.params;
    await GroupService.deleteGroup(id, req.auth);
    return res.json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteUserGroup(req, res, next) {
  try {
    const {
      id,
    } = req.params;
    await GroupService.deleteUserGroup(id);
    return res.json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateGroup(req, res, next) {
  try {
    const group = await GroupService.updateGroup(req.params.id, req.body, req.auth);
    return res.json({
      success: true,
      payload: group,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateUserGroup(req, res, next) {
  try {
    const group = await GroupService.updateUserGroup(req.params.id, req.body, req.auth);
    return res.json({
      success: true,
      payload: group,
    });
  } catch (error) {
    return next(error);
  }
}
