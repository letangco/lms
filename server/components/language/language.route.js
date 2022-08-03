import { Router } from 'express';
import * as LanguageController from './language.controller';

const router = new Router();

/**
 * @swagger
 * /languages:
 *   get:
 *     summary: Get languages
 *     tags:
 *       - Language
 *     responses:
 *       200:
 *         description: The languages data
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/Language'
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
    LanguageController.getLanguages,
  );

export default router;
