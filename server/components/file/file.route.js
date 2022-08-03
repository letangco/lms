import { Router } from 'express';
import * as FileController from './file.controller';
import { isAuthorized } from '../../api/auth.middleware';
import * as FileMulter from './file.multer';
import { multerBodyParser } from '../../api/multerBodyParser.middleware';
import * as FileValidation from './file.validation';

const router = new Router();
/**
 * @swagger
 * /files:
 *   post:
 *     summary: Upload file
 *     tags:
 *       - File
 *     parameters:
 *       - in: formData
 *         name: course-file
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
 *             "title": "Exam",
 *             "course": "6041e7d5bae1ef03dcc4d2eq",
 *             "type": "ACTIVE",
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
 *                "_id": "6045e1c6f0fd1d0cbc504cfc",
 *                "title": "Exam",
 *                "course": "6041e7d5bae1ef03dcc4d2eq"
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
    FileMulter.fileUploader,
    multerBodyParser,
    FileController.createFile,
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
    FileController.getFile,
  );

/**
 * @swagger
 * /files:
 *   put:
 *     summary: Update file
 *     tags:
 *       - File
 *     parameters:
 *       - name: id
 *         in: query
 *         description: The file id
 *         type: string
 *       - name: body
 *         in: body
 *         required: true
 *         description: The body stringify information for update file
 *         schema:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *             type:
 *               type: number
 *             status:
 *               type: string
 *           example: {
 *             "title": "High school",
 *             "status": "ACTIVE",
 *             "type": 2
 *           }
 *     responses:
 *       200:
 *         description: File updated
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
 *                "course": "6041e7d5bae1ef03dcc4d2eq"
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
  .put(
    isAuthorized(),
    FileController.updateFile,
  );

/**
 * @swagger
 * /files:
 *   delete:
 *     summary: Delete file
 *     tags:
 *       - File
 *     parameters:
 *       - name: id
 *         in: query
 *         description: The file id
 *         type: string
 *     responses:
 *       200:
 *         description: The file deleted
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
 *           example: File not found
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
 *                 "msg": "file Course id is invalid",
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
    FileController.deleteFile,
  );

/**
* @swagger
* /files/get-files:
*   get:
*     summary: Get files
*     tags:
*       - File
*     parameters:
*      - in: query
*        name: textSearch
*        type: string
*        description: textSearch for title
*      - in: query
*        name: status
*        type: string
*        description: Status file ACTIVE/INACTIVE/DELETED
*      - in: query
*        name: type
*        type: string
*        description: type file ACTIVE/INACTIVE/DELETED
*      - in: query
*        name: course
*        type: string
*        description: course id
*      - in: query
*        name: limit
*        type: number
*        description: Specifies the maximum number of file the query will return
*      - in: query
*        name: page
*        type: number
*        description: Specifies the number of file page
*     responses:
*       200:
*         name: body
*         in: body
*         required: true
*         description: List file
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
router.route('/get-files')
  .get(
    isAuthorized(),
    FileController.getFiles,
  );

/**
 * @swagger
 * /files/share-files:
 *   get:
 *     summary: Get share files
 *     tags:
 *       - File
 *     parameters:
 *      - in: query
 *        name: textSearch
 *        type: string
 *        description: textSearch for title
 *      - in: query
 *        name: course
 *        type: string
 *        description: course id
 *      - in: query
 *        name: limit
 *        type: number
 *        description: Specifies the maximum number of file the query will return
 *      - in: query
 *        name: page
 *        type: number
 *        description: Specifies the number of file page
 *     responses:
 *       200:
 *         name: body
 *         in: body
 *         required: true
 *         description: List file
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
 *                data: []
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
router.route('/share-files')
  .get(
    isAuthorized(),
    FileController.getShareFiles
  );


/**
 * @swagger
 * /files/{id}:
 *   get:
 *     summary: Get file information
 *     tags:
 *       - File
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The user information
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               $ref: '#/definitions/User'
 *           example: {
 *             success: true,
 *             payload: {}
 *           }
 */
/**
 * @swagger
 * /files/{id}:
 *   put:
 *     summary: Update file detail
 *     tags:
 *       - File
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The file id
 *         type: string
 *       - name: body
 *         in: body
 *         required: true
 *         description: Data update file share.type ["PUBLIC", "GROUP", "CUSTOM", "PRIVATE"], share.users - Array UserId
 *         schema:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *             share:
 *               type: object
 *           example: {
 *             "title": "High school",
 *             "share" : {
 *               "type": "CUSTOM",
 *               "users": ["60ab6d39068112118c4ff25e"],
 *             }
 *           }
 *     responses:
 *       200:
 *         description: File updated
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
 *                "course": "6041e7d5bae1ef03dcc4d2eq"
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
router.route('/:id')
  .get(
    FileValidation.getById,
    isAuthorized(),
    FileController.getById
  )
  .put(
    FileValidation.editById,
    isAuthorized(),
    FileController.editDetailFile
  );
export default router;
