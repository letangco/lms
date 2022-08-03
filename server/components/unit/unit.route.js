import { Router } from 'express';
import * as UnitController from './unit.controller';
import * as UnitValidator from './unit.validator';
import { isAuthorized } from '../../api/auth.middleware';

const router = new Router();
/**
 * @swagger
 * /units:
 *   post:
 *     tags:
 *       - Unit
 *     summary: Create unit course
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         properties:
 *             title:
 *               type: string
 *             content:
 *               type: string
 *             course:
 *               type: string
 *             type:
 *               type: number
 *             typeData:
 *               type: string
 *             complete:
 *               type: object
 *             link:
 *               type: string
 *             file:
 *               type: string
 *             config:
 *               type: object
 *             submission:
 *               type: string
 *             submissionType:
 *               type: string
 *         example: {
 *             "title": "Exam",
 *             "content": "ple",
 *             "course": "5e6c767594155330f20daf4a",
 *             "type": 1,
 *             "typeData": "LINK",
 *             "complete": {type: 1, data: {}},
 *             "link": "https://www.youtube.com/watch?v=3iUytoGTJjw",
 *             "file": "5e6c767594155330f20daf4a",
 *             "submission": "GROUP",
 *             "submissionType": "CAPTAIN",
 *             "config": {}
 *           }
 *     responses:
 *       200:
 *         description: The unit course
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 $ref: '#/definitions/Unit'
 *           example: {
 *             success: true,
 *             payload: {
 *               _id: "5f092acdfd2938050e3d5ed5",
 *               title: "Ex"
 *             }
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
 *                 msg: 'Course type is invalid',
 *                 param: 'course',
 *                 location: 'body',
 *                 value: '5e6c767594155330f20daf4a',
 *               },
 *               {
 *                 msg: 'Type type is invalid',
 *                 param: 'type',
 *                 location: 'body',
 *                 value: 'form 1 to 14',
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 */
router.route('/')
  .post(
    isAuthorized(),
    UnitValidator.createUnit,
    UnitController.createUnit
  );

/**
 * @swagger
 * /units:
 *   get:
 *     summary: Get an unit course
 *     tags:
 *       - Unit
 *     parameters:
 *       - name: id
 *         in: query
 *         required: true
 *         description: id of Unit Course
 *     responses:
 *       200:
 *         description: The unit course
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 $ref: '#/definitions/Unit'
 *           example: {
 *             success: true,
 *             payload: {
 *               _id: "5f092acdfd2938050e3d5ed5",
 *               title: "Ex",
 *               link: "https://lsm.tesse.io/"
 *             }
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
 *                 msg: 'Course type is invalid',
 *                 param: 'course',
 *                 location: 'body',
 *                 value: '5e6c767594155330f20daf4a',
 *               },
 *               {
 *                 msg: 'Type type is invalid',
 *                 param: 'type',
 *                 location: 'body',
 *                 value: 'form 1 to 14',
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 */
router.route('/')
  .get(
    isAuthorized(),
    UnitController.getUnit
  );

/**
 * @swagger
 * /units:
 *   put:
 *     summary: Update unit course
 *     tags:
 *       - Unit
 *     parameters:
 *       - name: id
 *         in: query
 *         required: true
 *         description: id of Unit Course
 *       - name: body
 *         in: body
 *         required: true
 *         properties:
 *           title:
 *             type: string
 *           content:
 *             type: string
 *           typeData:
 *             type: string
 *           link:
 *             type: string
 *           file:
 *             type: string
 *           complete:
 *             type: object
 *           submission:
 *             type: string
 *           submissionType:
 *             type: string
 *           config:
 *             type: object
 *         example: {
 *           "title": "A Privacy Policy is a Legal Requirement",
 *           "content": "Lorem is content",
 *           "typeData": "LINK",
 *           "link": "https://lms.tesse.io",
 *           "file": "5e6c767594155330f20daf4a",
 *           "complete": {type: 1, data: {}},
 *           "submission": "GROUP",
 *           "submissionType": "CAPTAIN",
 *           "config": {}
 *         }
 *     responses:
 *       200:
 *         description: The unit course
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 $ref: '#/definitions/Unit'
 *           example: {
 *             success: true,
 *             payload: {
 *               _id: "5f092acdfd2938050e3d5ed5",
 *               title: "Ex",
 *               link: "https://lsm.tesse.io/"
 *             }
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
 *                 msg: 'Course type is invalid',
 *                 param: 'course',
 *                 location: 'body',
 *                 value: '5e6c767594155330f20daf4a',
 *               },
 *               {
 *                 msg: 'Type type is invalid',
 *                 param: 'type',
 *                 location: 'body',
 *                 value: 'form 1 to 14',
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 */

router.route('/')
  .put(
    isAuthorized(),
    UnitValidator.updateUnit,
    UnitController.updateUnit
  );

/**
 * @swagger
 * /units/:id/classrooms:
 *   post:
 *     summary: Save classroom
 *     tags:
 *       - Unit
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: id of unit classroom
 *     responses:
 *       200:
 *         description: The classroom saved
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *           example: {
 *             success: true,
 *           }
 *       401:
 *         description: Unauthorized
 *         schema:
 *           type: string
 *       404:
 *         description: Unit not found
 *         schema:
 *           type: string
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
 *                 value: '',
 *                 msg: 'Unit id is invalid',
 *                 param: 'id',
 *                 location: 'params',
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 */

router.route('/:id/classrooms')
  .post(
    UnitValidator.saveClassroom,
    isAuthorized(),
    UnitController.saveClassroom
  );

/**
 * @swagger
 * /units:
 *   delete:
 *     summary: Delete unit course
 *     tags:
 *       - Unit
 *     parameters:
 *       - name: id
 *         in: query
 *         description: The unit course id
 *         type: string
 *     responses:
 *       200:
 *         description: The unit course deleted
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: boolean
 *           example: {
 *              success: true,
 *              payload: true
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
 *                 "msg": "Unit Course id is invalid",
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
    UnitValidator.deleteUnit,
    UnitController.deleteUnit
  );

/**
 * @swagger
 * /units/quick-update:
 *   put:
 *     summary: Quick update unit course
 *     tags:
 *       - Unit
 *     parameters:
 *       - name: id
 *         in: query
 *         description: The unit course id
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
 *           example: {
 *             "title": "High school",
 *             "type": "status"
 *           }
 *     responses:
 *       200:
 *         description: The unit course updated
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
 *       304:
 *         description: Not Modified
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
router.route('/quick-update')
  .put(
    isAuthorized(),
    UnitValidator.quickUpdateUnit,
    UnitController.quickUpdateUnit
  );

/**
 * @swagger
 * /units/sort-units:
 *   put:
 *     summary: Sort unit course
 *     tags:
 *       - Unit
 *     parameters:
 *       - name: id
 *         in: query
 *         description: The course id
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
 *             "title": "High school",
 *             "type": "status",
 *             "order": 1
 *           }]
 *     responses:
 *       200:
 *         description: The unit course sorted
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
 *       304:
 *         description: Not Modified
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
router.route('/sort-units')
  .put(
    isAuthorized(),
    UnitController.sortUnits
  );

/**
 * @swagger
 * /units/sort-questions:
 *   put:
 *     summary: Sort questions
 *     tags:
 *       - Unit
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
 *             "title": "High school",
 *             "type": "status",
 *             "order": 1
 *           }]
 *     responses:
 *       200:
 *         description: The unit course sorted
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
 *       304:
 *         description: Not Modified
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
router.route('/sort-questions')
  .put(
    isAuthorized(),
    UnitController.sortQuestions
  );

/**
 * @swagger
 * /units/update-question-weight:
 *   put:
 *     summary: Update unit question weight
 *     tags:
 *       - Unit
 *     parameters:
 *       - name: id
 *         in: query
 *         description: The unit question id
 *         type: string
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             weight:
 *               type: Number
 *           example: {
 *             "weight": 1
 *           }
 *     responses:
 *       200:
 *         description: The unit question updated
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
 *       304:
 *         description: Not Modified
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
router.route('/update-question-weight')
  .put(
    isAuthorized(),
    UnitController.updateQuestionWeight
  );

/**
 * @swagger
 * /units/add-question:
 *   post:
 *     tags:
 *       - Unit
 *     summary: Create question
 *     parameters:
 *       - name: id
 *         in: query
 *         description: The unit id
 *         type: string
 *       - name: body
 *         in: body
 *         required: true
 *         properties:
 *             course:
 *               type: string
 *             question:
 *               type: string
 *         example: {
 *             "question": "ple",
 *             "course": "5e6c767594155330f20daf4a"
 *           }
 *     responses:
 *       200:
 *         description: The unit question created
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 $ref: '#/definitions/Unit'
 *           example: {
 *             success: true,
 *             payload: {
 *               _id: "5f092acdfd2938050e3d5ed5",
 *               course: "Ex",
 *               question: "Ex"
 *             }
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
 *                 msg: 'Course type is invalid',
 *                 param: 'course',
 *                 location: 'body',
 *                 value: '5e6c767594155330f20daf4a',
 *               },
 *               {
 *                 msg: 'Section type is invalid',
 *                 param: 'section',
 *                 location: 'body',
 *                 value: '5e6c767594155330f20daf4a',
 *               },
 *               {
 *                 msg: 'Type type is invalid',
 *                 param: 'type',
 *                 location: 'body',
 *                 value: 'form 1 to 14',
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 */
router.route('/add-question')
  .post(
    isAuthorized(),
    UnitController.addQuestion
  );

/**
 * @swagger
 * /units/add-survey:
 *   post:
 *     tags:
 *       - Unit
 *     summary: Create survey
 *     parameters:
 *       - name: id
 *         in: query
 *         description: The unit survey id
 *         type: string
 *       - name: body
 *         in: body
 *         required: true
 *         properties:
 *             survey:
 *               type: string
 *         example: {
 *             "survey": "5e6c767594155330f20daf4a"
 *           }
 *     responses:
 *       200:
 *         description: The unit question created
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 $ref: '#/definitions/Unit'
 *           example: {
 *             success: true,
 *             payload: {
 *               _id: "5f092acdfd2938050e3d5ed5",
 *               course: "Ex",
 *               question: "Ex"
 *             }
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
 *                 msg: 'Course type is invalid',
 *                 param: 'course',
 *                 location: 'body',
 *                 value: '5e6c767594155330f20daf4a',
 *               },
 *               {
 *                 msg: 'Section type is invalid',
 *                 param: 'section',
 *                 location: 'body',
 *                 value: '5e6c767594155330f20daf4a',
 *               },
 *               {
 *                 msg: 'Type type is invalid',
 *                 param: 'type',
 *                 location: 'body',
 *                 value: 'form 1 to 14',
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 */
router.route('/add-survey')
  .post(
    isAuthorized(),
    UnitController.addSurvey
  );

/**
 * @swagger
 * /units/remove-question:
 *   delete:
 *     summary: Delete question
 *     tags:
 *       - Unit
 *     parameters:
 *       - name: id
 *         in: query
 *         description: The unit question id
 *         type: string
 *     responses:
 *       200:
 *         description: The unit question deleted
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: boolean
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
 *                 "msg": "Unit Course id is invalid",
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
router.route('/remove-question')
  .delete(
    isAuthorized(),
    UnitController.removeQuestion
  );

/**
 * @swagger
 * /units/remove-survey:
 *   delete:
 *     summary: Delete survey
 *     tags:
 *       - Unit
 *     parameters:
 *       - name: id
 *         in: query
 *         description: The unit survey id
 *         type: string
 *     responses:
 *       200:
 *         description: The unit survey deleted
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: boolean
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
 *                 "msg": "Unit Course id is invalid",
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
router.route('/remove-survey')
  .delete(
    isAuthorized(),
    UnitController.removeSurvey
  );

/**
 * @swagger
 * /units/update-options:
 *   put:
 *     summary: Update options unit
 *     tags:
 *       - Unit
 *     parameters:
 *       - name: id
 *         in: query
 *         required: true
 *         description: id of Unit
 *       - name: body
 *         in: body
 *         required: true
 *         properties:
 *           config:
 *             type: Object
 *         example: {
 *           "config": {}
 *         }
 *     responses:
 *       200:
 *         description: The unit course
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 $ref: '#/definitions/Unit'
 *           example: {
 *             success: true,
 *             payload: {
 *               _id: "5f092acdfd2938050e3d5ed5",
 *               title: "Ex",
 *               link: "https://lsm.tesse.io/"
 *             }
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
 *                 msg: 'Course type is invalid',
 *                 param: 'course',
 *                 location: 'body',
 *                 value: '5e6c767594155330f20daf4a',
 *               },
 *               {
 *                 msg: 'Section type is invalid',
 *                 param: 'section',
 *                 location: 'body',
 *                 value: '5e6c767594155330f20daf4a',
 *               },
 *               {
 *                 msg: 'Type type is invalid',
 *                 param: 'type',
 *                 location: 'body',
 *                 value: 'form 1 to 14',
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 */
router.route('/update-options')
  .put(
    isAuthorized(),
    UnitController.updateOptions
  );

/**
 * @swagger
 * /units/sort-surveys:
 *   put:
 *     summary: Sort unit survey
 *     tags:
 *       - Unit
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
 *       304:
 *         description: Not Modified
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

router.route('/sort-surveys')
  .put(
    isAuthorized(),
    UnitController.sortSurveys
  );

/**
 * @swagger
 * /units/clone-unit:
 *   post:
 *     summary: Clone an unit course
 *     tags:
 *       - Unit
 *     parameters:
 *       - name: id
 *         in: query
 *         description: The unit course id
 *         type: string
 *     responses:
 *       200:
 *         description: The unit course cloned
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
 *       304:
 *         description: Not Modified
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
router.route('/clone-unit')
  .post(
    isAuthorized(),
    UnitController.cloneUnit
  );

/**
 * @swagger
 * /units/get-units:
 *   get:
 *     summary: Get units
 *     tags:
 *       - Unit
 *     parameters:
 *       - name: course
 *         in: query
 *         description: The id of course
 *         type: string
 *       - name: status
 *         in: query
 *         description: The status of unit ACTIVE/INACTIVE/DELETED/DRAFT
 *         type: string
 *       - name: type
 *         in: query
 *         description: The type of unit
 *         type: string
 *       - name: textSearch
 *         in: query
 *         description: The keyword to search unit
 *         type: string
 *       - name: page
 *         in: query
 *         description: The page want to load
 *         type: string
 *       - name: limit
 *         in: query
 *         description: The limit want to load
 *         type: string
 *     responses:
 *       200:
 *         description: The units data response
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/SessionUser'
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
    UnitController.getUnits
  );

/**
 * @swagger
 * /units/get-submissions:
 *   get:
 *     summary: Get unit submissions
 *     tags:
 *       - Unit
 *     parameters:
 *       - name: id
 *         in: query
 *         description: The id of unit
 *         type: string
 *       - name: status
 *         in: query
 *         description: The status of unit ACTIVE/INACTIVE/DELETED/DRAFT
 *         type: string
 *       - name: page
 *         in: query
 *         description: The page want to load
 *         type: string
 *       - name: limit
 *         in: query
 *         description: The limit want to load
 *         type: string
 *     responses:
 *       200:
 *         description: The unit submissions data response
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/SessionUser'
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
 *               }
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/get-submissions')
  .get(
    isAuthorized(),
    UnitController.getUnitSubmissions
  );

/**
 * @swagger
 * /units/get-submission:
 *   get:
 *     summary: Get info unit submission
 *     tags:
 *       - Unit
 *     parameters:
 *       - name: id
 *         in: query
 *         description: The unit submission id
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: The unit submission info
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               $ref: '#/definitions/Group'
 *           example: {
 *              success: true,
 *              payload: {
 *                _id: "60421913582070092a398322",
 *                name: "High school",
 *                description: "High school group",
 *                key: "randomKey1",
 *                price: 12.3,
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
 *           example: Group not found
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
 *                 "msg": "Group id is invalid",
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
router.route('/get-submission')
  .get(
    isAuthorized(),
    UnitController.getUnitSubmission
  );

/**
 * @swagger
 * /units/grade-submission:
 *   post:
 *     summary: Update unit grade submission
 *     tags:
 *       - Unit
 *     parameters:
 *       - name: id
 *         in: query
 *         description: The user unit id
 *         type: string
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             comment:
 *               type: string
 *             grade:
 *               type: string
 *             status:
 *               type: string
 *           example: {
 *             "comment": "High school",
 *             "grade": "100",
 *             "status": "COMPLETED/INACTIVE/PENDING",
 *           }
 *     responses:
 *       200:
 *         description: The unit grade submission updated
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 key:
 *                   type: string
 *                 price:
 *                   type: number
 *           example: {
 *              success: true,
 *              payload: {
 *                "_id": "60421913582070092a398322",
 *                "name": "High school",
 *                "description": "High school group",
 *                "key": "randomKey1",
 *                "price": 12.3,
 *              }
 *           }
 *       304:
 *         description: Not Modified
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
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/grade-submission')
  .post(
    isAuthorized(),
    UnitController.gradeUnitSubmission
  );

router.route('/reset-submission')
  .post(
    isAuthorized(),
    UnitController.resetUnitSubmission
  );

router.route('/undo-grade-submission')
  .put(
    isAuthorized(),
    UnitController.undoGradeSubmission
  );

router.route('/check-unit-link')
  .get(
    isAuthorized(),
    UnitController.checkUnitLink
  );

router.route('/get-tracking-result-unit')
  .get(
    isAuthorized(),
    UnitController.getTrackingResultUnit
  );

router.route('/get-slideshare-iframe')
  .get(
    isAuthorized(),
    UnitController.getSlideShareIframe
  );
export default router;
