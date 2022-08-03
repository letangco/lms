import { Router } from 'express';
import * as SurveyController from './survey.controller';
import * as SurveyValidator from './survey.validator';
import { isAuthorized } from '../../api/auth.middleware';

const router = new Router();
/**
 * @swagger
 * /surveys:
 *   post:
 *     summary: Create Survey
 *     tags:
 *       - Survey
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *             content:
 *               type: string
 *             type:
 *               type: string
 *             data:
 *               type: Object
 *             tag:
 *               type: Array
 *             feedback:
 *               type: string
 *             status:
 *               type: string
 *           example: {
 *             "title": "Exam",
 *             "content": "ple",
 *             "type": 1,
 *             "data": {},
 *             "tag": ["Hello", "Exercise"],
 *             "feedback": "Your pass",
 *             "status": "ACTIVE"
 *           }
 *     responses:
 *       200:
 *         description: The Survey
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 $ref: '#/definitions/Survey'
 *           example: {
 *             success: true,
 *             payload: {
 *               _id: "5f092acdfd2938050e3d5ed5",
 *               title: "Ex"
 *             }
 *           }
 *       403:
 *         description: When data cannot be process
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
 *             ]
 *           }
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
 *                 msg: 'Title cannot exceed 150 characters',
 *                 param: 'title',
 *                 location: 'body',
 *                 value: 'title_content',
 *               },
 *               {
 *                 msg: 'Type type is invalid',
 *                 param: 'type',
 *                 location: 'body',
 *                 value: '1 or 2',
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 */
router.route('/')
  .post(
    isAuthorized(),
    SurveyValidator.createSurvey,
    SurveyController.createSurvey
  );

/**
 * @swagger
 * /surveys:
 *   get:
 *     summary: Get survey
 *     tags:
 *       - Survey
 *     parameters:
 *       - name: id
 *         in: query
 *         description: The survey id
 *         type: string
 *     responses:
 *       200:
 *         description: The survey data
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 $ref: '#/definitions/Survey'
 *           example: {
 *              success: true,
 *              payload: {
 *                "instructors": [
 *                  {
 *                    "_id": "6045e1c6f0fd1d0cbc504cfc",
 *                    "firstName": "Exam",
 *                    "lastName": "ple",
 *                    "username": "example",
 *                    "fullName": "Exam ple"
 *                  }
 *                ],
 *                "status": "ACTIVE",
 *                "_id": "604b4105f70b39217bd85169",
 *                "thumbnail": "http://localhost:3101/uploads/12-3-2021/course-thumbnail/boardingpass_mynameonmars_mars2020-1615544581898.png",
 *                "name": "Exam",
 *                "category": {
 *                  "_id": "604a0aa584ffcb1d9f67e9e1",
 *                  "name": "Low school"
 *                },
 *                "description": "example",
 *                "code": "111",
 *                "price": 131,
 *                "teachingLanguage": {
 *                  "_id": "604b359eff01e82076c22f5b",
 *                  "name": "Tiếng Việt",
 *                  "value": "vi"
 *                },
 *                "creator": {
 *                  "_id": "6045e1c6f0fd1d0cbc504cfc",
 *                  "firstName": "Exam",
 *                  "lastName": "ple",
 *                  "username": "example",
 *                  "fullName": "Exam ple"
 *                }
 *              }
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
 *           example: Survey not found
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
 *                 "msg": "Survey id is invalid",
 *                 "param": "id",
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
    isAuthorized(),
    SurveyController.getSurvey
  );

/**
 * @swagger
 * /surveys:
 *   put:
 *     summary: Update survey
 *     tags:
 *       - Survey
 *     parameters:
 *       - name: id
 *         in: query
 *         description: The survey id
 *         type: string
 *       - name: body
 *         in: body
 *         required: true
 *         description: The body stringify information for update survey
 *         schema:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *             content:
 *               type: string
 *             data:
 *               type: object
 *             tag:
 *               type: array
 *             feedback:
 *               type: string
 *           example: {
 *             "title": "High school",
 *             "feedback": "good",
 *             "content": "this is content for survey",
 *             "data": {},
 *             "tag": [],
 *           }
 *     responses:
 *       200:
 *         description: survey updated
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 $ref: '#/definitions/survey'
 *           example: {
 *              success: true,
 *              payload: {
 *                "n": 1,
 *                "nModified": 1,
 *                "ok": 1
 *              }
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
 *           example: Survey not found
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/')
  .put(
    isAuthorized(),
    SurveyValidator.updateSurvey,
    SurveyController.updateSurvey
  );

/**
 * @swagger
 * /surveys:
 *   delete:
 *     summary: Delete survey
 *     tags:
 *       - Survey
 *     parameters:
 *       - name: id
 *         in: query
 *         description: The survey id
 *         type: string
 *     responses:
 *       200:
 *         description: The survey deleted
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *           example: {
 *              success: true,
 *              payload: {
 *                "n": 1,
 *                "ok": 1,
 *                "deletedCount": 1
 *              }
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
 *           example: Survey not found
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
 *                 "msg": "Survey Course id is invalid",
 *                 "param": "id",
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
  .delete(
    isAuthorized(),
    SurveyValidator.deleteSurvey,
    SurveyController.deleteSurvey
  );

/**
* @swagger
* /surveys/get-surveys:
*   get:
*     summary: Get surveys
*     tags:
*       - Survey
*     parameters:
*      - in: query
*        name: textSearch
*        type: string
*        description: textSearch for title
*      - in: query
*        name: status
*        type: string
*      - in: query
*        name: type
*        type: string
*        description: type survey ACTIVE/INACTIVE/DELETED
*      - in: query
*        name: course
*        type: string
*        description: course id
*      - in: query
*        name: limit
*        type: number
*        description: Specifies the maximum number of survey the query will return
*      - in: query
*        name: page
*        type: number
*        description: Specifies the number of survey page
*     responses:
*       200:
*         name: body
*         in: body
*         required: true
*         description: List survey
*         schema:
*           type: object
*           properties:
*             $ref: '#/definitions/User'
*           example: {
*              success: true,
*              payload: {
*                totalItems: 1,
*                currentPage: 1,
*                totalPage: 1,
*                data: [
*                  {
*                      "_id": "5fc49a51af171e5aa4320868",
*                      "status": "ACTIVE",
*                      "title": "My School",
*                      "type": 0,
*                      "complete": {},
*                      "content": "This is content lorem",
*                      "link": "https://lms.tesse.io"
*                  }
*                ]
*              }
*           }
*       401:
*         description: Unauthorized
*         schema:
*           type: array
*           items:
*             type: object
*             properties:
*               $ref: '#/definitions/ValidatorErrorItem'
*           example: {
*             success: false,
*             errors: [
*               {
*                 "param": "UNAUTHORIZED"
*               }
*             ]
*           }
*       500:
*         description: When got server exception
*         schema:
*           type: string
*           example: "Internal server error"
*/
router.route('/get-surveys')
  .get(
    isAuthorized(),
    SurveyController.getSurveys
  );
export default router;
