import { Router } from 'express';
import * as CourseController from './userCourse.controller';
import * as UserCourseValidator from './userCourse.validator';

import { isAuthorized } from '../../api/auth.middleware';

const router = new Router();

/**
 * @swagger
 * /user-courses/get-units:
 *   get:
 *     summary: Get course unit
 *     tags:
 *       - Unit course
 *     parameters:
 *       - name: id
 *         in: query
 *         description: Course id
 *     responses:
 *       200:
 *         description: The courses data
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
 *                  {
 *                    _id: "5f092acdfd2938050e3d5ed5",
 *                    title: "Ex",
 *                    link: "https://lsm.tesse.io/"
 *                  }
 *                ]
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
 *               }
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/get-units')
  .get(
    isAuthorized(),
    CourseController.getCourseUnits,
  );
/**
 * @swagger
 * /user-courses/get-unit-complete-percent:
 *   get:
 *     summary: Get course complete percent
 *     tags:
 *       - Unit course
 *     parameters:
 *       - name: id
 *         in: query
 *         description: Course id
 *     responses:
 *       200:
 *         description: complete percent
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
 *              "payload": 33
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
router.route('/get-unit-complete-percent')
  .get(
    isAuthorized(),
    UserCourseValidator.getCourse,
    CourseController.getUnitCompleted,
  );
/**
 * @swagger
 * /user-courses/user-complete-unit:
 *   post:
 *     summary: User complete unit
 *     tags:
 *       - Unit course
 *     parameters:
 *       - name: id
 *         in: query
 *         description: The unit id
 *         type: string
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *             type:
 *               type: string
 *             order:
 *               type: Number
 *           example: [{
 *             "_id": "605313a8dc5c7a2374996283",
 *             "title": "High school",
 *             "content": "status",
 *             "feedback": "no problem"
 *           }]
 *     responses:
 *       200:
 *         description: The unit survey sorted
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                 status:
 *                   type: string
 *           example: {
 *              success: true,
 *              payload: {
 *                "title": "High school group",
 *                "type": "status"
 *              }
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
router.route('/user-complete-unit')
  .post(
    isAuthorized(),
    UserCourseValidator.getUnit,
    CourseController.completeUnit,
  );
/**
 * @swagger
 * /user-courses/get-unit:
 *   get:
 *     summary: Get unit detail
 *     tags:
 *       - Unit course
 *     parameters:
 *       - name: id
 *         in: query
 *         description: unit id
 *     responses:
 *       200:
 *         description: Unit detail
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
router.route('/get-unit')
  .get(
    isAuthorized(),
    UserCourseValidator.getUnit,
    CourseController.getUnit,
  );
/**
 * @swagger
 * /user-courses/submit-unit-question:
 *   post:
 *     summary: Submit unit question
 *     tags:
 *       - Unit question
 *     parameters:
 *       - name: id
 *         in: query
 *         description: unit id
 *       - name: question
 *         in: query
 *         description: question id
 *       - name: next
 *         in: query
 *         description: No. of next question
 *       - name: skip
 *         in: query
 *         description: next or pre step (true/false)
 *       - name: questionLink
 *         in: query
 *         description: question link
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             password:
 *               type: string
 *           example: {
 *           }
 *     responses:
 *       200:
 *         description: Start unit question
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
router.route('/submit-unit-question')
  .post(
    isAuthorized(),
    UserCourseValidator.getUnit,
    UserCourseValidator.getQuestion,
    CourseController.submitUnitQuestion,
  );
/**
 * @swagger
 * /user-courses/submit-unit-survey:
 *   post:
 *     summary: Submit unit survey
 *     tags:
 *       - Unit survey
 *     parameters:
 *       - name: id
 *         in: query
 *         description: unit id
 *       - name: survey
 *         in: query
 *         description: survey id
 *       - name: next
 *         in: query
 *         description: No. of next survey
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             password:
 *               type: string
 *           example: {
 *           }
 *     responses:
 *       200:
 *         description: Start unit survey
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
router.route('/submit-unit-survey')
  .post(
    isAuthorized(),
    UserCourseValidator.getUnit,
    UserCourseValidator.getSurvey,
    CourseController.submitUnitSurvey,
  );
/**
 * @swagger
 * /user-courses/start-unit-question:
 *   post:
 *     summary: Start unit question
 *     tags:
 *       - Unit question
 *     parameters:
 *       - name: id
 *         in: query
 *         description: unit id
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             password:
 *               type: string
 *           example: {
 *           }
 *     responses:
 *       200:
 *         description: Start unit question
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
router.route('/start-unit-question')
  .post(
    isAuthorized(),
    UserCourseValidator.getUnit,
    CourseController.startUnitQuestion,
  );
/**
 * @swagger
 * /user-courses/start-unit-survey:
 *   post:
 *     summary: Start unit survey
 *     tags:
 *       - Unit survey
 *     parameters:
 *       - name: id
 *         in: query
 *         description: unit id
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             password:
 *               type: string
 *           example: {
 *             "id": "605313a8dc5c7a2374996283",
 *             "password": "123321"
 *           }
 *     responses:
 *       200:
 *         description: Start unit survey
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
router.route('/start-unit-survey')
  .post(
    isAuthorized(),
    UserCourseValidator.getUnit,
    CourseController.startUnitSurvey,
  );
/**
 * @swagger
 * /user-courses/reset-unit-result:
 *   post:
 *     summary: User reset unit result
 *     tags:
 *       - Unit course
 *     parameters:
 *       - name: id
 *         in: query
 *         description: unit id
 *     responses:
 *       200:
 *         description: User reset unit result
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
router.route('/reset-unit-result')
  .post(
    isAuthorized(),
    UserCourseValidator.getUnit,
    CourseController.resetUnitResult,
  );
export default router;
