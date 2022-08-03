import { Router } from 'express';
import * as IntakeValidator from './course.validator';
import * as IntakeController from './course.controller';
import { isAuthorized } from '../../api/auth.middleware';

const router = new Router();

/**
 * @swagger
 * /intakes:
 *   get:
 *     summary: Get intakes
 *     tags:
 *       - Intake
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
 *         description: Search by intake name
 *         type: string
 *       - name: role
 *         in: query
 *         description: The user role on intake
 *         type: string
 *       - name: course
 *         in: query
 *         description: The course intake
 *         type: string
 *     responses:
 *       200:
 *         description: The intakes data
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/Course'
 *           example: {
 *              success: true,
 *              "payload": {
 *                "data": [
 *                ],
 *                "currentPage": 1,
 *                "totalPage": 1,
 *                "totalItems": 1
 *              }
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
 *               },
 *               {
 *                 "msg": "User role is not valid",
 *                 "param": "role",
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/')
  .get(
    IntakeValidator.getCourses,
    isAuthorized(),
    IntakeController.getAllIntakes,
  );
export default router;
