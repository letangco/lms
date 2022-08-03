import * as UserReportService from './userReport.service';

export async function getUserReportSummaries(req, res, next) {
  try {
    const data = await UserReportService.getUserReportSummaries();
    return res.json({
      success: true,
      payload: data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getUsers(req, res, next) {
  try {
    const {
      page,
      rowPerPage,
      textSearch,
      order,
      orderBy,
      status,
      type // role
    } = req.query;
    const data = await UserReportService.getUsers(page, rowPerPage, textSearch, order, orderBy, status, type);
    return res.json({
      success: true,
      payload: data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getUserCoursesReport(req, res, next) {
  try {
    const {
      page,
      rowPerPage,
      order,
      orderBy,
      status,
      userRole
    } = req.query;
    const data = await UserReportService.getUserCoursesReport(req.params.id, page, rowPerPage, order, orderBy, status, userRole);
    return res.json({
      success: true,
      payload: data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getUser(req, res, next) {
  try {
    const user = await UserReportService.getUser(req.params.id);
    return res.json({
      success: true,
      payload: user,
    });
  } catch (error) {
    return next(error);
  }
}
