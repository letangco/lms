import * as ReportService from './report.service';

export async function getReportsTest(req, res, next) {
  try {
    const { auth } = req;
    const {
      page,
      rowPerPage,
      textSearch,
      course,
      order,
      orderBy,
      status,
      courseStatus
    } = req.query;
    const payload = await ReportService.getReportsTest(page, rowPerPage, {
      textSearch,
      courseId: course,
      auth,
      order,
      orderBy,
      status,
      courseStatus
    });
    return res.json({
      success: true,
      payload
    });
  } catch (error) {
    return next(error);
  }
}

export async function getReportsSurvey(req, res, next) {
  try {
    const { auth } = req;
    const {
      page,
      rowPerPage,
      textSearch,
      course,
      order,
      orderBy,
      status,
      courseStatus
    } = req.query;
    const payload = await ReportService.getReportsSurvey(page, rowPerPage, {
      textSearch,
      courseId: course,
      auth,
      order,
      orderBy,
      status,
      courseStatus
    });
    return res.json({
      success: true,
      payload
    });
  } catch (error) {
    return next(error);
  }
}

export async function getReportsAssignment(req, res, next) {
  try {
    const { auth } = req;
    const {
      page,
      rowPerPage,
      textSearch,
      course,
      order,
      orderBy,
      status,
      courseStatus
    } = req.query;
    const payload = await ReportService.getReportsAssignment(page, rowPerPage, {
      textSearch, courseId: course, auth, order, orderBy, status, courseStatus
    });
    return res.json({
      success: true,
      payload
    });
  } catch (error) {
    return next(error);
  }
}
export async function getReportsScorm(req, res, next) {
  try {
    const { auth } = req;
    const {
      page,
      rowPerPage,
      textSearch,
      course,
      order,
      orderBy,
      status,
      courseStatus
    } = req.query;
    const payload = await ReportService.getReportsScorm(page, rowPerPage, {
      textSearch, courseId: course, auth, order, orderBy, status, courseStatus
    });
    return res.json({
      success: true,
      payload
    });
  } catch (error) {
    return next(error);
  }
}
export async function getReportTest(req, res, next) {
  try {
    const { auth } = req;
    const {
      page,
      rowPerPage,
      order,
      orderBy,
      status
    } = req.query;
    const {
      id
    } = req.params;
    const payload = await ReportService.getReportTest(id, page, rowPerPage, {
      auth,
      order,
      orderBy,
      status
    });
    return res.json({
      success: true,
      payload
    });
  } catch (error) {
    return next(error);
  }
}

export async function getReportSurvey(req, res, next) {
  try {
    const { auth } = req;
    const {
      page,
      rowPerPage,
      order,
      orderBy,
      status
    } = req.query;
    const {
      id
    } = req.params;
    const payload = await ReportService.getReportSurvey(id, page, rowPerPage, {
      auth,
      order,
      orderBy,
      status
    });
    return res.json({
      success: true,
      payload
    });
  } catch (error) {
    return next(error);
  }
}

export async function getReportTestDetail(req, res, next) {
  try {
    const { auth } = req;
    const {
      id
    } = req.params;
    const payload = await ReportService.getReportTestDetail(id, auth);
    return res.json({
      success: true,
      payload
    });
  } catch (error) {
    return next(error);
  }
}

export async function getReportSurveyDetail(req, res, next) {
  try {
    const { auth } = req;
    const {
      id
    } = req.params;
    const payload = await ReportService.getReportSurveyDetail(id, auth);
    return res.json({
      success: true,
      payload
    });
  } catch (error) {
    return next(error);
  }
}

export async function getReportAssignmentDetail(req, res, next) {
  try {
    const { auth } = req;
    const {
      id
    } = req.params;
    const payload = await ReportService.getReportAssignmentDetail(id, auth);
    return res.json({
      success: true,
      payload
    });
  } catch (error) {
    return next(error);
  }
}

export async function getReportScormDetail(req, res, next) {
  try {
    const { auth } = req;
    const {
      id
    } = req.params;
    const payload = await ReportService.getReportScormDetail(id, auth);
    return res.json({
      success: true,
      payload
    });
  } catch (error) {
    return next(error);
  }
}

export async function getReportAssignment(req, res, next) {
  try {
    const { auth } = req;
    const {
      page,
      rowPerPage,
      order,
      orderBy,
      status
    } = req.query;
    const {
      id
    } = req.params;
    const payload = await ReportService.getReportAssignment(id, page, rowPerPage, {
      auth,
      order,
      orderBy,
      status
    });
    return res.json({
      success: true,
      payload
    });
  } catch (error) {
    return next(error);
  }
}


export async function getReportScorm(req, res, next) {
  try {
    const { auth } = req;
    const {
      page,
      rowPerPage,
      order,
      orderBy,
      status
    } = req.query;
    const {
      id
    } = req.params;
    const payload = await ReportService.getReportScorm(id, page, rowPerPage, {
      auth,
      order,
      orderBy,
      status
    });
    return res.json({
      success: true,
      payload
    });
  } catch (error) {
    return next(error);
  }
}
