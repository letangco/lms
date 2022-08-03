import * as GroupService from './group.service';

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

export async function getGroups(req, res, next) {
  try {
    const {
      page,
      rowPerPage,
      textSearch,
    } = req.query;
    const groups = await GroupService.getGroups(page, rowPerPage, textSearch);
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
    await GroupService.deleteGroup(id);
    return res.json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateGroup(req, res, next) {
  try {
    const group = await GroupService.updateGroup(req.params.id, req.body);
    return res.json({
      success: true,
      payload: group,
    });
  } catch (error) {
    return next(error);
  }
}
