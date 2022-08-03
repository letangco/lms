import { Router } from 'express';
import * as CourseReportController from './courseReport.controller';
import * as CourseReportValidator from './courseReport.validator';
import { isAuthorized } from '../../api/auth.middleware';

const router = new Router();

/**
 * @swagger
 * /reports/courses/summaries:
 *   get:
 *     summary: Get course report summaries
 *     tags:
 *       - Course Report
 *     responses:
 *       200:
 *         description: The course report summaries
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 courses:
 *                   type: number
 *                 assignedLearners:
 *                   type: number
 *                 completedLearners:
 *                   type: number
 *                 learnersInProgress:
 *                   type: number
 *           example: {
 *             success: true,
 *             payload: {
 *               courses: 2,
 *               assignedLearners: 1,
 *               completedLearners: 6,
 *               learnersInProgress: 3,
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
router.route('/courses/summaries')
  .get(
    isAuthorized(),
    CourseReportController.getCourseReportSummaries,
  );

/**
 * @swagger
 * /reports/courses:
 *   get:
 *     summary: Get courses report
 *     tags:
 *       - Course Report
 *     parameters:
 *       - name: page
 *         in: query
 *         description: The page want to load
 *         type: string
 *         required: true
 *       - name: rowPerPage
 *         in: query
 *         description: The rowPerPage want to load
 *         type: string
 *       - name: textSearch
 *         in: query
 *         description: Search user by name
 *         type: string
 *     responses:
 *       200:
 *         description: The courses
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       $ref: '#/definitions/Course'
 *                 currentPage:
 *                   type: number
 *                 totalPage:
 *                   type: number
 *                 totalItems:
 *                   type: number
 *           example: {
 *             success: true,
 *             payload: {
 *               "data": [
 *               ],
 *               "currentPage": 1,
 *               "totalPage": 1,
 *               "totalItems": 4
 *             }
 *           }
 *       401:
 *         description: Unauthorized
 *         schema:
 *           type: string
 *           example: Unauthorized
 *       422:
 *         description: Unprocessable Entity, the data is not valid
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             errors:
 *               type: array
 *               items:
 *                 $ref: "#/definitions/ValidatorErrorItem"
 *           example: {
 *             success: false,
 *             errors: [
 *               {
 *                 "msg": "Page number must be a positive integer",
 *                 "param": "page",
 *               },
 *               {
 *                 "msg": "Row per page must be a positive integer not larger than 200",
 *                 "param": "rowPerPage",
 *               }
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/courses')
  .get(
    CourseReportValidator.getCourses,
    isAuthorized(),
    CourseReportController.getCourses,
  );

/**
 * @swagger
 * /reports/courses/{id}/users:
 *   get:
 *     summary: Get courses users report
 *     tags:
 *       - Course Report
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: the course id
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         description: The page want to load
 *         type: string
 *         required: true
 *       - name: rowPerPage
 *         in: query
 *         description: The rowPerPage want to load
 *         type: string
 *     responses:
 *       200:
 *         description: The user courses report
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 currentPage:
 *                   type: number
 *                 totalPage:
 *                   type: number
 *                 totalItems:
 *                   type: number
 *           example: {
 *             success: true,
 *             payload: {
 *               "data": [
 *               ],
 *               "currentPage": 1,
 *               "totalPage": 1,
 *               "totalItems": 4
 *             }
 *           }
 *       401:
 *         description: Unauthorized
 *         schema:
 *           type: string
 *           example: Unauthorized
 *       422:
 *         description: Unprocessable Entity, the data is not valid
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             errors:
 *               type: array
 *               items:
 *                 $ref: "#/definitions/ValidatorErrorItem"
 *           example: {
 *             success: false,
 *             errors: [
 *               {
 *                 "value": "aaa",
 *                 "msg": "Course id is invalid",
 *                 "param": "id",
 *                 "location": "param"
 *               },
 *               {
 *                 "msg": "Page number must be a positive integer",
 *                 "param": "page",
 *               },
 *               {
 *                 "msg": "Row per page must be a positive integer not larger than 200",
 *                 "param": "rowPerPage",
 *               }
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/courses/:id/users')
  .get(
    CourseReportValidator.getCourseUsersReport,
    isAuthorized(),
    CourseReportController.getCourseUsersReport,
  );

/**
 * @swagger
 * /reports/courses/{id}:
 *   get:
 *     summary: Get user information
 *     tags:
 *       - Course Report
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The user information
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               $ref: '#/definitions/User'
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
 *       404:
 *         description: Not found
 *         schema:
 *           type: string
 *           example: User not found
 *       422:
 *         description: Unprocessable Entity, the data is not valid
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             errors:
 *               type: array
 *               items:
 *                 $ref: "#/definitions/ValidatorErrorItem"
 *           example: {
 *             success: false,
 *             errors: [
 *               {
 *                 "value": "aaa",
 *                 "msg": "Course id is invalid",
 *                 "param": "id",
 *                 "location": "param"
 *               }
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/courses/:id')
  .get(
    CourseReportValidator.getCourse,
    isAuthorized(),
    CourseReportController.getCourse,
  );

router.route('/courses/:id/get-intake')
  .get(
    CourseReportValidator.getCourse,
    isAuthorized(),
    CourseReportController.getIntakesByCourse,
  );

export default router;
