import { Router } from 'express';
import * as QuestionController from './question.controller';
import { isAuthorized } from '../../api/auth.middleware';

const router = new Router();
/**
 * @swagger
 * /user-questions:
 *   get:
 *     summary: User get question
 *     tags:
 *       - User Question
 *     parameters:
 *       - name: id
 *         in: query
 *         description: The unit course id
 *         type: string
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
 *       500:
 *         description: When got server exception
 */
router.route('/')
  .get(
    isAuthorized(),
    QuestionController.userGetQuestion
  )
export default router;
