import { Router } from 'express';
import * as UserReportController from './userReport.controller';
import * as UserReportValidator from './userReport.validator';
import { isAuthorized } from '../../api/auth.middleware';

const router = new Router();

/**
 * @swagger
 * /reports/users/summaries:
 *   get:
 *     summary: Get user report summaries
 *     tags:
 *       - User Report
 *     responses:
 *       200:
 *         description: The user report summaries
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 learners:
 *                   type: number
 *                 courseAssignments:
 *                   type: number
 *                 completedCourses:
 *                   type: number
 *                 coursesInProgress:
 *                   type: number
 *           example: {
 *             success: true,
 *             payload: {
 *               learners: 2,
 *               courseAssignments: 1,
 *               completedCourses: 6,
 *               coursesInProgress: 3,
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
router.route('/users/summaries')
  .get(
    isAuthorized(),
    UserReportController.getUserReportSummaries,
  );

/**
 * @swagger
 * /reports/users:
 *   get:
 *     summary: Get users report
 *     tags:
 *       - User Report
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
 *         description: The users
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
 *                       $ref: '#/definitions/User'
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
router.route('/users')
  .get(
    UserReportValidator.getUsers,
    isAuthorized(),
    UserReportController.getUsers,
  );

/**
 * @swagger
 * /reports/users/{id}/courses:
 *   get:
 *     summary: Get user courses report
 *     tags:
 *       - User Report
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: the user id
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
 *                 "msg": "User id is invalid",
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
router.route('/users/:id/courses')
  .get(
    UserReportValidator.getUserCoursesReport,
    isAuthorized(),
    UserReportController.getUserCoursesReport,
  );

/**
 * @swagger
 * /reports/users/{id}:
 *   get:
 *     summary: Get user information
 *     tags:
 *       - User Report
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
 *                 "msg": "User id is invalid",
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
router.route('/users/:id')
  .get(
    UserReportValidator.getUser,
    isAuthorized(),
    UserReportController.getUser,
  );
export default router;
