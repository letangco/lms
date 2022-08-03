import { Router } from 'express';
import { isAuthorized } from '../../api/auth.middleware';
import * as ReportController from './report.controller';

const router = new Router();

/**
 * @swagger
 * /report:
 *   get:
 *     summary: Get test report
 *     tags:
 *       - Report
 *     responses:
 *       200:
 *         description: Tests report
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 type: string
 *           example: {
 *             success: true,
 *             payload: {
 *             }
 *           }
 *       401:
 *         description: Unauthorized
 *         schema:
 *           type: string
 *           example: Unauthorized
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/get-report-test')
  .get(
    isAuthorized(),
    ReportController.getReportsTest
  );
/**
 * @swagger
 * /report:
 *   get:
 *     summary: Get survey report
 *     tags:
 *       - Report
 *     responses:
 *       200:
 *         description: Surveys report
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 type: string
 *           example: {
 *             success: true,
 *             payload: {
 *             }
 *           }
 *       401:
 *         description: Unauthorized
 *         schema:
 *           type: string
 *           example: Unauthorized
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/get-report-survey')
  .get(
    isAuthorized(),
    ReportController.getReportsSurvey
  );
router.route('/get-report-test/:id')
  .get(
    isAuthorized(),
    ReportController.getReportTest
  );
router.route('/get-report-test-detail/:id')
  .get(
    isAuthorized(),
    ReportController.getReportTestDetail
  );
router.route('/get-report-survey/:id')
  .get(
    isAuthorized(),
    ReportController.getReportSurvey
  );
router.route('/get-report-survey-detail/:id')
  .get(
    isAuthorized(),
    ReportController.getReportSurveyDetail
  );

router.route('/get-report-assignment')
  .get(
    isAuthorized(),
    ReportController.getReportsAssignment
  );
router.route('/get-report-assignment/:id')
  .get(
    isAuthorized(),
    ReportController.getReportAssignment
  );
router.route('/get-report-assignment-detail/:id')
  .get(
    isAuthorized(),
    ReportController.getReportAssignmentDetail
  );

router.route('/get-report-scorm')
  .get(
    isAuthorized(),
    ReportController.getReportsScorm
  );
router.route('/get-report-scorm/:id')
  .get(
    isAuthorized(),
    ReportController.getReportScorm
  );
router.route('/get-report-scorm-detail/:id')
  .get(
    isAuthorized(),
    ReportController.getReportScormDetail
  );

export default router;
