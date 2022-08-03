import { Router } from 'express';
import * as QuestionController from './question.controller';
import * as QuestionValidator from './question.validator';
import { isAuthorized } from '../../api/auth.middleware';

const router = new Router();
/**
 * @swagger
 * /questions:
 *   post:
 *     summary: Create question
 *     tags:
 *       - Question
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
 *               type: Array
 *             tag:
 *               type: Array
 *             feedback:
 *               type: string
 *             status:
 *               type: string
 *           example: {
 *             "title": "Exam",
 *             "content": "ple",
 *             "type": "FILLTHEGAP",
 *             "data": [],
 *             "tag": ["Hello", "Exercise"],
 *             "feedback": "Your pass",
 *             "status": "ACTIVE"
 *           }
 *     responses:
 *       200:
 *         description: The question
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 $ref: '#/definitions/Question'
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
 *                 value: 'from 1 to 10',
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 */
router.route('/')
  .post(
    isAuthorized(),
    QuestionValidator.createQuestion,
    QuestionController.createQuestion
  );

/**
 * @swagger
 * /questions:
 *   get:
 *     summary: Get question
 *     tags:
 *       - Question
 *     parameters:
 *       - name: id
 *         in: query
 *         required: true
 *         description: id of question
 *     responses:
 *       200:
 *         description: The question
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 $ref: '#/definitions/Question'
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
 *       404:
 *         description: Not found
 *         schema:
 *           type: string
 *           example: Question not found
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
 *                 msg: 'Question type is invalid',
 *                 param: 'type',
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
    QuestionController.getQuestion
  );

/**
 * @swagger
 * /questions:
 *   put:
 *     summary: Update questions
 *     tags:
 *       - Question
 *     parameters:
 *       - name: id
 *         in: query
 *         required: true
 *         description: id of question
 *       - name: body
 *         in: body
 *         required: true
 *         properties:
 *           title:
 *             type: string
 *           content:
 *             type: string
 *           data:
 *             type: string
 *           feedback:
 *             type: string
 *           tag:
 *             type: array
 *         example: {
 *           "title": "A Privacy Policy is a Legal Requirement",
 *           "content": "Lorem is content",
 *           "data": "LINK",
 *           "feedback": "very good",
 *           "tag": []
 *         }
 *     responses:
 *       200:
 *         description: The question updated
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 $ref: '#/definitions/Question'
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
 *                 msg: 'Question id is invalid',
 *                 param: 'id',
 *                 location: 'query',
 *                 value: 'id',
 *               },
 *               {
 *                 msg: 'Title cannot exceed 10 characters',
 *                 param: 'title',
 *                 location: 'body',
 *                 value: '5e6c767594155330f20daf4a',
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 */
router.route('/')
  .put(
    isAuthorized(),
    QuestionValidator.updateQuestion,
    QuestionController.updateQuestion
  );

/**
 * @swagger
 * /questions:
 *   delete:
 *     summary: Delete question
 *     tags:
 *       - Question
 *     parameters:
 *       - name: id
 *         in: query
 *         description: The question id
 *         type: string
 *     responses:
 *       200:
 *         description: The question deleted
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
 *       404:
 *         description: Not found
 *         schema:
 *           type: string
 *           example: Question not found
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
 *                 "msg": "question id is invalid",
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
    QuestionValidator.deleteQuestion,
    QuestionController.deleteQuestion
  );

/**
* @swagger
* /questions/get-questions:
*   get:
*     summary: Get questions
*     tags:
*       - Question
*     parameters:
*      - in: query
*        name: textSearch
*        type: string
*        description: textSearch for title
*      - in: query
*        name: status
*        type: string
*        description: Status question ACTIVE/INACTIVE/DELETED
*      - in: query
*        name: type
*        type: string
*        description: type question ACTIVE/INACTIVE/DELETED
*      - in: query
*        name: course
*        type: string
*      - in: query
*        name: unit
*        type: string
*        description: course id
*      - in: query
*        name: limit
*        type: number
*        description: Specifies the maximum number of question the query will return
*      - in: query
*        name: page
*        type: number
*        description: Specifies the number of question page
*     responses:
*       200:
*         name: body
*         in: body
*         required: true
*         description: List question
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
router.route('/get-questions')
  .get(
    isAuthorized(),
    QuestionController.getQuestions
  );

export default router;
