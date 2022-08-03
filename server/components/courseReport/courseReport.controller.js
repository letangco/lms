import { USER_TYPE_UNIT_STATUS } from '../../constants';
import { checkUserTypeByConditions } from '../userType/userType.service';
import * as CourseReportService from './courseReport.service';

export async function getCourseReportSummaries(req, res, next) {
  try {
    const { typeCourse } = req.query;
    const data = await CourseReportService.getCourseReportSummaries(typeCourse);
    return res.json({
      success: true,
      payload: data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getCourses(req, res, next) {
  try {
    const {
      page,
      rowPerPage,
      textSearch,
      order,
      orderBy,
      status,
      category,
      typeCourse
    } = req.query;
    const data = await CourseReportService.getCourses(page, rowPerPage, textSearch, order, orderBy, status, category, typeCourse);
    return res.json({
      success: true,
      payload: data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getCourseUsersReport(req, res, next) {
  try {
    const {
      page,
      rowPerPage,
      order,
      orderBy,
      status,
      userRole
    } = req.query;
    const data = await CourseReportService.getCourseUsersReport(req.params.id, page, rowPerPage, order, orderBy, status, userRole);
    return res.json({
      success: true,
      payload: data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getCourse(req, res, next) {
  try {
    const user = await CourseReportService.getCourse(req.params.id);
    return res.json({
      success: true,
      payload: user,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getIntakesByCourse(req, res) {
  try {
    await checkUserTypeByConditions({
      _id: req.auth?.type,
      status: USER_TYPE_UNIT_STATUS.ACTIVE
    });
    const { id } = req.params;
    const {
      page,
      rowPerPage,
      textSearch,
      order,
      orderBy,
      status,
      category,
    } = req.query;
    return res.json({
      success: true,
      payload: await CourseReportService.getIntakesByCourse(id, page, rowPerPage, textSearch, order, orderBy, status, category)
    });
  } catch (error) {
    return next(error);
  }
}
