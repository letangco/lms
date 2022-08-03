import * as GroupService from './chatGroup.service';

export async function createGroup(req, res, next) {
  try {
    const {
      body,
      auth,
      query
    } = req;
    const group = await GroupService.createGroup(auth, body.users, query.type);
    return res.json({
      success: true,
      payload: group,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getUserGroups(req, res, next) {
  try {
    const auth = req.auth;
    const {
      firstTime,
      lastTime,
      rowPerPage,
      textSearch,
      type,
    } = req.query;
    const data = await GroupService.getUserGroups(auth._id, rowPerPage, firstTime, lastTime, textSearch, type);
    return res.json({
      success: true,
      payload: data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getUserGroup(req, res, next) {
  try {
    const auth = req.auth;
    const {
      id,
    } = req.params;
    const data = await GroupService.getUserGroupDetail(auth._id, id);
    return res.json({
      success: true,
      payload: data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function resetUnreadMessage(req, res, next) {
  try {
    const auth = req.auth;
    const {
      id,
    } = req.params;
    await GroupService.resetUnreadMessage(auth._id, id);
    return res.json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateGroup(req, res, next) {
  try {
    const auth = req.auth;
    const {
      id,
    } = req.params;
    const {
      name,
    } = req.body;
    const group = await GroupService.updateGroup(auth._id, id, {
      name: name,
    });
    return res.json({
      success: true,
      payload: group,
    });
  } catch (error) {
    return next(error);
  }
}
