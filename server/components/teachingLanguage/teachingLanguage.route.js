import { Router } from 'express';
import * as TeachingLanguageController from './teachingLanguage.controller';

const router = new Router();

/**
 * @swagger
 * /teaching-languages:
 *   get:
 *     summary: Get teaching languages
 *     tags:
 *       - Teaching Language
 *     responses:
 *       200:
 *         description: The teaching languages data
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/TeachingLanguage'
 *           example: {
 *              success: true,
 *              payload: [
 *                {
 *                  "_id": "60421f520ec4e2099c8393ea",
 *                  "name": "English",
 *                  "value": "en",
 *                },
 *              ]
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/')
  .get(
    TeachingLanguageController.getTeachingLanguages,
  );

export default router;
