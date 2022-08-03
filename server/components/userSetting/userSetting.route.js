import { Router } from 'express';
import { isAuthorized } from '../../api/auth.middleware';
import * as SettingController from './userSetting.controller';
import { multerBodyParser } from '../../api/multerBodyParser.middleware';
import * as UploadMulter from '../../api/upload.multer';

const router = new Router();

router.route('/get-meta-data')
  .get(
    SettingController.getSettingMetaData,
  );

/**
 * @swagger
 * /settings:
 *   post:
 *     summary: Create setting
 *     tags:
 *       - Setting
 *     parameters:
 *       - name: type
 *         in: query
 *         required: true
 *         description: Config type
 *         schema:
 *           type: string
 *       - in: formData
 *         name: logo
 *         type: file
 *         description: The setting logo
 *       - in: formData
 *         name: favicon
 *         type: file
 *         description: The setting favicon
 *       - in: formData
 *         name: data
 *         type: object
 *         description: The body stringify information
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             description:
 *               type: string
 *             conferences:
 *               type: string
 *             bbb:
 *               type: object
 *           example: {
 *             "name": "LMS",
 *             "description": "LMS",
 *             "conferences": "BBB",
 *             "bbb": {}
 *           }
 *     responses:
 *       200:
 *         description: The setting created
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 $ref: '#/definitions/Setting'
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
 *                 "msg": "Site name cannot exceed 35 characters",
 *                 "param": "name",
 *               },
 *               {
 *                 "msg": "Site description cannot exceed 255 characters",
 *                 "param": "description",
 *               }
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/')
  .post(
    isAuthorized(),
    UploadMulter.uploadMulter,
    multerBodyParser,
    SettingController.createSetting,
  );

/**
 * @swagger
 * /settings/{type}:
 *   get:
 *     summary: Get setting
 *     tags:
 *       - Setting
 *     parameters:
 *       - name: type
 *         in: path
 *         description: The setting type
 *         type: string
 *     responses:
 *       200:
 *         description: The setting
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
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
router.route('/:type')
  .get(
    isAuthorized(),
    SettingController.getSetting,
  );
export default router;
