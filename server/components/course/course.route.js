import { Router } from 'express';
import * as CourseValidator from './course.validator';
import * as CourseController from './course.controller';
import * as CourseMulter from './course.multer';
import { isAuthorized } from '../../api/auth.middleware';
import { multerBodyParser } from '../../api/multerBodyParser.middleware';
import * as UserValidator from '../user/user.validator';

const router = new Router();

/**
 * @swagger
 * /courses/search:
 *   get:
 *     summary: Get courses by id pagination
 *     tags:
 *       - Course
 *     parameters:
 *       - name: firstId
 *         in: query
 *         description: The first id of current sessions list on client, the users response will newer than the current newest session
 *         type: string
 *       - name: lastId
 *         in: query
 *         description: The last id of current sessions list on client, the users response will older than the current oldest session
 *         type: string
 *       - name: rowPerPage
 *         in: query
 *         description: The rowPerPage want to load
 *         type: string
 *       - name: textSearch
 *         in: query
 *         description: The textSearch search by session name
 *         type: string
 *       - name: exceptionIds
 *         in: query
 *         description: The course ids want to exclude from results
 *         type: string
 *     responses:
 *       200:
 *         description: The courses
 *         schema:
 *           type: object
 *           example: {
 *             success: true,
 *             payload: [
 *             ],
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
 *                 "value": "firstId",
 *                 "msg": "First id is invalid",
 *                 "param": "firstId",
 *                 "location": "query"
 *               },
 *               {
 *                 "value": "lastId",
 *                 "msg": "Last id is invalid",
 *                 "param": "lastId",
 *                 "location": "query"
 *               },
 *               {
 *                 "value": "abc",
 *                 "msg": "Row per page must be a number",
 *                 "param": "rowPerPage",
 *                 "location": "query"
 *               },
 *               {
 *                 "value": "abc",
 *                 "msg": "Course id is invalid",
 *                 "param": "exceptionIds[0]",
 *                 "location": "query"
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/search')
  .get(
    CourseValidator.searchCourses,
    isAuthorized(),
    CourseController.searchCourses,
  );

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Get courses
 *     tags:
 *       - Course
 *     parameters:
 *       - name: page
 *         in: query
 *         description: The page want to load
 *         type: string
 *         required: true
 *       - name: rowPerPage
 *         in: query
 *         description: The rowPerPage want to load
 *         type: string
 *       - name: textSearch
 *         in: query
 *         description: Search by course name
 *         type: string
 *       - name: role
 *         in: query
 *         description: The user role on course
 *         type: string
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
 *               },
 *               {
 *                 "msg": "User role is not valid",
 *                 "param": "role",
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
    CourseValidator.getCourses,
    isAuthorized(),
    CourseController.getCourses,
  );

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Create course
 *     tags:
 *       - Course
 *     parameters:
 *       - in: formData
 *         name: course-thumbnail
 *         type: file
 *         description: The course thumbnail
 *       - in: formData
 *         name: data
 *         type: object
 *         description: The body stringify information
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             category:
 *               type: string
 *             description:
 *               type: string
 *             code:
 *               type: string
 *             price:
 *               type: number
 *             videoIntro:
 *               type: string
 *             teachingLanguage:
 *               type: string
 *             status:
 *               type: string
 *           example: {
 *             "name": "Exam",
 *             "category": "6041e7d5bae1ef03dcc4d2eq",
 *             "description": "example",
 *             "code": "111",
 *             "price": 131,
 *             "videoIntro": "https://www.youtube.com/watch?v=VIDEO_ID",
 *             "teachingLanguage": "6041e7d5bae1ef03dcc4d2e2",
 *             "status": "ACTIVE",
 *           }
 *     responses:
 *       200:
 *         description: The course created
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 $ref: '#/definitions/Course'
 *           example: {
 *              success: true,
 *              payload: {
 *                "status": "ACTIVE",
 *                "_id": "60519cb4b8a82807f002c246",
 *                "name": "Exam",
 *                "category": {
 *                  "_id": "604a0aa584ffcb1d9f67e9e1",
 *                  "name": "Low school"
 *                },
 *                "description": "example",
 *                "code": "111",
 *                "price": 131,
 *                "videoIntro": "https://www.youtube.com/watch?v=VIDEO_ID",
 *                "teachingLanguage": {
 *                  "_id": "604b359eff01e82076c22f5b",
 *                  "name": "Tiếng Việt",
 *                  "value": "vi"
 *                },
 *                "creator": {
 *                  "_id": "6045e1c6f0fd1d0cbc504cfc",
 *                  "firstName": "Exadm",
 *                  "lastName": "ple",
 *                  "username": "nhannguyen",
 *                  "fullName": "Exadm ple"
 *                }
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
 *                 "msg": "Course name cannot exceed 100 characters",
 *                 "param": "name",
 *               },
 *               {
 *                 "msg": "Course category id is not valid",
 *                 "param": "category",
 *               },
 *               {
 *                 "msg": "Course teaching language id is not valid",
 *                 "param": "teachingLanguage",
 *               },
 *               {
 *                 "msg": "Course description cannot exceed 5000 characters",
 *                 "param": "description",
 *               },
 *               {
 *                 "msg": "Course code cannot exceed 20 characters",
 *                 "param": "code",
 *               },
 *               {
 *                 "msg": "Course price must be positive number",
 *                 "param": "price",
 *               },
 *               {
 *                 "msg": "Course video intro cannot exceed 1000 characters",
 *                 "param": "videoIntro",
 *               },
 *               {
 *                 "msg": "The course status is not valid",
 *                 "param": "status",
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
  .post(
    isAuthorized(),
    CourseMulter.courseThumbnailUploader,
    multerBodyParser,
    CourseValidator.createCourse,
    CourseController.createCourse,
  );

/**
 * @swagger
 * /courses/{id}:
 *   put:
 *     summary: Update course
 *     tags:
 *       - Course
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The course id
 *         type: string
 *       - in: formData
 *         name: course-thumbnail
 *         type: file
 *         description: The course thumbnail
 *       - in: formData
 *         name: data
 *         type: object
 *         description: The body stringify information
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             category:
 *               type: string
 *             description:
 *               type: string
 *             code:
 *               type: string
 *             price:
 *               type: number
 *             videoIntro:
 *               type: string
 *             teachingLanguage:
 *               type: string
 *             status:
 *               type: string
 *             unset:
 *               type: object
 *               properties:
 *                 category:
 *                   type: boolean
 *                 thumbnail:
 *                   type: boolean
 *                 price:
 *                   type: boolean
 *           example: {
 *             "name": "Exam",
 *             "category": "6041e7d5bae1ef03dcc4d2eq",
 *             "description": "example",
 *             "code": "111",
 *             "price": 131,
 *             "videoIntro": "https://www.youtube.com/watch?v=VIDEO_ID",
 *             "teachingLanguage": "6041e7d5bae1ef03dcc4d2e2",
 *             "status": "ACTIVE",
 *           }
 *     responses:
 *       200:
 *         description: The course created
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 $ref: '#/definitions/Course'
 *           example: {
 *              success: true,
 *              payload: {
 *                "status": "ACTIVE",
 *                "_id": "60519cb4b8a82807f002c246",
 *                "name": "Exam",
 *                "category": {
 *                  "_id": "604a0aa584ffcb1d9f67e9e1",
 *                  "name": "Low school"
 *                },
 *                "description": "example",
 *                "code": "111",
 *                "price": 131,
 *                "videoIntro": "https://www.youtube.com/watch?v=VIDEO_ID",
 *                "teachingLanguage": {
 *                  "_id": "604b359eff01e82076c22f5b",
 *                  "name": "Tiếng Việt",
 *                  "value": "vi"
 *                },
 *                "creator": {
 *                  "_id": "6045e1c6f0fd1d0cbc504cfc",
 *                  "firstName": "Exadm",
 *                  "lastName": "ple",
 *                  "username": "nhannguyen",
 *                  "fullName": "Exadm ple"
 *                }
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
 *                 "msg": "Course id is invalid",
 *                 "param": "id",
 *               },
 *               {
 *                 "msg": "Course name cannot exceed 100 characters",
 *                 "param": "name",
 *               },
 *               {
 *                 "msg": "Course category id is not valid",
 *                 "param": "category",
 *               },
 *               {
 *                 "msg": "Course teaching language id is not valid",
 *                 "param": "teachingLanguage",
 *               },
 *               {
 *                 "msg": "Course description cannot exceed 5000 characters",
 *                 "param": "description",
 *               },
 *               {
 *                 "msg": "Course code cannot exceed 20 characters",
 *                 "param": "code",
 *               },
 *               {
 *                 "msg": "Course price must be positive number",
 *                 "param": "price",
 *               },
 *               {
 *                 "msg": "Course video intro cannot exceed 1000 characters",
 *                 "param": "videoIntro",
 *               },
 *               {
 *                 "msg": "The course status is not valid",
 *                 "param": "status",
 *               },
 *               {
 *                 "msg": "Course category unset value must be boolean",
 *                 "param": "unset.category",
 *               },
 *               {
 *                 "msg": "Course thumbnail unset value must be boolean",
 *                 "param": "unset.thumbnail",
 *               },
 *               {
 *                 "msg": "Course price unset value must be boolean",
 *                 "param": "unset.price",
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/:id')
  .put(
    isAuthorized(),
    CourseMulter.courseThumbnailUploader,
    multerBodyParser,
    CourseValidator.updateCourse,
    CourseController.updateCourse,
  );

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     summary: Delete course
 *     tags:
 *       - Course
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The course id
 *         type: string
 *     responses:
 *       200:
 *         description: The course deleted
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *           example: {
 *              success: true,
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
 *                 "msg": "Course id is invalid",
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
router.route('/:id')
  .delete(
    CourseValidator.deleteCourse,
    isAuthorized(),
    CourseController.deleteCourse,
  );

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Get course detail
 *     tags:
 *       - Course
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The course id
 *         type: string
 *     responses:
 *       200:
 *         description: The course data
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 $ref: '#/definitions/Course'
 *           example: {
 *              success: true,
 *              payload: {
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
 *         description: Course not found
 *         schema:
 *           type: string
 *           example: Course not found
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
 *                 "msg": "Course id is invalid",
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
router.route('/:id')
  .get(
    CourseValidator.getCourse,
    isAuthorized(),
    CourseController.getCourse,
  );

/**
 * @swagger
 * /courses/import-user/{id}:
 *   post:
 *     summary: Import user
 *     tags:
 *       - Course
 *     parameters:
 *       - name: id
 *         in: path
 *         type: string
 *         description: The course id
 *       - name: data
 *         in: body
 *         type: object
 *         description: The body stringify information
 *         schema:
 *           type: object
 *           properties:
 *             data:
 *               type: array
 *           example: {
 *             "data": [
 *                {
 *                  "email": "example@gmail.com",
 *                  "firstName": "Nguyen",
 *                  "lastName": "Teo",
 *                  "bio": "100"
 *                },
 *                {
 *                  "email": "example1@gmail.com",
 *                  "firstName": "Nguyen",
 *                  "lastName": "Ti",
 *                  "bio": "120"
 *                }
 *             ]
 *           }
 *     responses:
 *       200:
 *         description: The list user has imported
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 $ref: '#/definitions/Course'
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
 *                 "msg": "Course id is invalid",
 *                 "param": "course",
 *               },
 *               {
 *                 "msg": "File import is not empty",
 *                 "param": "user",
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/import-user/:id')
  .post(
    isAuthorized(),
    UserValidator.verifyImportUser,
    CourseValidator.getCourse,
    CourseController.importUser,
  );

/**
 * @swagger
 * /courses/check-import-user/{id}:
 *   post:
 *     summary: Check import user
 *     tags:
 *       - Course
 *     parameters:
 *       - name: id
 *         in: path
 *         type: string
 *         description: The course id
 *       - name: data
 *         in: body
 *         type: object
 *         description: The body stringify information
 *         schema:
 *           type: object
 *           properties:
 *             data:
 *               type: array
 *           example: {
 *             "data": [
 *                {
 *                  "email": "example@gmail.com"
 *                },
 *                {
 *                  "email": "example1@gmail.com"
 *                }
 *             ]
 *           }
 *     responses:
 *       200:
 *         description: The list check user has imported
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: object
 *               properties:
 *                 $ref: '#/definitions/Course'
 *           example: {
 *              success: true,
 *              payload: {
 *                "done": [],
 *                "failed": [],
 *                "exist": ["example@gmail.com","example1@gmail.com"]
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
 *                 "msg": "Course id is invalid",
 *                 "param": "course",
 *               },
 *               {
 *                 "msg": "File import is not empty",
 *                 "param": "user",
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/check-import-user/:id')
  .post(
    isAuthorized(),
    CourseValidator.getCourse,
    UserValidator.verifyImportUser,
    CourseController.checkImportUser,
  );

router.route('/:id/create-intake')
  .post(
    isAuthorized(),
    CourseValidator.getCourse,
    CourseController.createIntake,
  );
router.route('/:id/get-intake')
  .get(
    isAuthorized(),
    CourseValidator.getCourse,
    CourseController.getIntakes,
  );

/**
 * @swagger
 * /courses/{id}/units:
 *   get:
 *     summary: Get course units
 *     tags:
 *       - Course
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Course id
 *         schema:
 *           type: string
 *       - name: firstId
 *         in: query
 *         description: The first id of current sessions list on client, the users response will newer than the current newest session
 *         type: string
 *       - name: lastId
 *         in: query
 *         description: The last id of current sessions list on client, the users response will older than the current oldest session
 *         type: string
 *       - name: rowPerPage
 *         in: query
 *         description: The rowPerPage want to load
 *         type: string
 *       - name: textSearch
 *         in: query
 *         description: The textSearch search by session name
 *         type: string
 *       - name: types
 *         in: query
 *         description: The unit types
 *         type: string
 *     responses:
 *       200:
 *         description: The units
 *         schema:
 *           type: object
 *           example: {
 *             success: true,
 *             payload: [
 *               {
 *                 "_id": "606ac39f98603c0480ac6825",
 *                 "title": "Test_1617609631343",
 *               }
 *             ],
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
 *                 "msg": "Course id is invalid",
 *                 "param": "id",
 *               },
 *               {
 *                 "value": "firstId",
 *                 "msg": "First id is invalid",
 *                 "param": "firstId",
 *                 "location": "query"
 *               },
 *               {
 *                 "value": "lastId",
 *                 "msg": "Last id is invalid",
 *                 "param": "lastId",
 *                 "location": "query"
 *               },
 *               {
 *                 "value": "abc",
 *                 "msg": "Row per page must be a number",
 *                 "param": "rowPerPage",
 *                 "location": "query"
 *               },
 *               {
 *                 "value": "abc",
 *                 "msg": "The unit type is invalid",
 *                 "param": "types",
 *                 "location": "query"
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/:id/units')
  .get(
    CourseValidator.getCourseUnits,
    isAuthorized(),
    CourseController.getCourseUnits,
  );

/**
 * @swagger
 * /courses/{id}/questions:
 *   get:
 *     summary: Get course questions
 *     tags:
 *       - Course
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Course id
 *         schema:
 *           type: string
 *       - name: firstId
 *         in: query
 *         description: The first id of current sessions list on client, the users response will newer than the current newest session
 *         type: string
 *       - name: lastId
 *         in: query
 *         description: The last id of current sessions list on client, the users response will older than the current oldest session
 *         type: string
 *       - name: rowPerPage
 *         in: query
 *         description: The rowPerPage want to load
 *         type: string
 *       - name: textSearch
 *         in: query
 *         description: The textSearch search by session name
 *         type: string
 *     responses:
 *       200:
 *         description: The questions
 *         schema:
 *           type: object
 *           example: {
 *             success: true,
 *             payload: [
 *             ],
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
 *                 "msg": "Course id is invalid",
 *                 "param": "id",
 *               },
 *               {
 *                 "value": "firstId",
 *                 "msg": "First id is invalid",
 *                 "param": "firstId",
 *                 "location": "query"
 *               },
 *               {
 *                 "value": "lastId",
 *                 "msg": "Last id is invalid",
 *                 "param": "lastId",
 *                 "location": "query"
 *               },
 *               {
 *                 "value": "abc",
 *                 "msg": "Row per page must be a number",
 *                 "param": "rowPerPage",
 *                 "location": "query"
 *               },
 *             ]
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */
router.route('/:id/questions')
  .get(
    CourseValidator.getCourseQuestions,
    isAuthorized(),
    CourseController.getCourseQuestions,
  );

export default router;
