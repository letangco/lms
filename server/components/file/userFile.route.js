import { Router } from 'express';
import * as FileController from './file.controller';
import { isAuthorized } from '../../api/auth.middleware';
import * as FileMulter from './file.multer';
import { multerBodyParser } from '../../api/multerBodyParser.middleware';

const router = new Router();
/**
 * @swagger
 * /users-file:
 *   post:
 *     summary: User upload file
 *     tags:
 *       - File
 *     parameters:
 *       - in: formData
 *         name: users-file
 *         type: file
 *         description: Upload file
 *       - in: formData
 *         name: data
 *         type: object
 *         description: The body stringify information
 *         schema:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *             course:
 *               type: string
 *             type:
 *               type: string
 *           example: {
 *           }
 *     responses:
 *       200:
 *         description: File created
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 $ref: '#/definitions/File'
 *           example: {
 *              success: true,
 *              payload: {
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
router.route('/')
  .post(
    isAuthorized(),
    FileMulter.fileUploaderUser,
    multerBodyParser,
    FileController.userCreateFile,
  );

/**
 * @swagger
 * /files:
 *   get:
 *     summary: Get file
 *     tags:
 *       - File
 *     parameters:
 *       - name: id
 *         in: query
 *         description: The file id
 *         type: string
 *     responses:
 *       200:
 *         description: File information
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 $ref: '#/definitions/File'
 *           example: {
 *              success: true,
 *              payload: {
 *                "_id": "6045e1c6f0fd1d0cbc504cfc",
 *                "title": "Exam",
 *                "course": "6041e7d5bae1ef03dcc4d2eq",
 *                "originalname": "Example originalname",
 *                "filename": "color.xlxs"
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
 *           example: File not found
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/')
  .get(
    isAuthorized(),
    FileController.userGetFile,
  );
export default router;
