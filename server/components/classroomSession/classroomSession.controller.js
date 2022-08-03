import * as ClassroomSessionService from './classroomSession.service';

export async function getClassroomSessions(req, res, next) {
  try {
    const {
      auth,
    } = req;
    const {
      begin,
      end,
    } = req.query;
    const data = await ClassroomSessionService.getClassroomSessions(auth, req.params.id, begin, end);
    return res.json({
      success: true,
      payload: data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function searchClassroomSessions(req, res, next) {
  try {
    const {
      firstId,
      lastId,
      rowPerPage,
      textSearch,
      types,
    } = req.query;
    const data = await ClassroomSessionService.searchClassroomSessions(req.params.id, rowPerPage, firstId, lastId, textSearch, types);
    return res.json({
      success: true,
      payload: data,
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
      textSearch,
      order,
      orderBy,
    } = req.query;
    const {
      course,
      unit,
    } = req.params;
    const data = await ClassroomSessionService.getSessionUsers(course, unit, {
      pageNum: page, rowPerPage, textSearch, order, orderBy,
    });
    return res.json({
      success: true,
      payload: data,
    });
  } catch (error) {
    return next(error);
  }
}
