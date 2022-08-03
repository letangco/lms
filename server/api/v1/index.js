import morgan from 'morgan';
import swaggerUI from 'swagger-ui-express';
import { Router } from 'express';
import { MORGAN_FORMAT } from '../../constants';
import swaggerSpecV1 from './docs';

import userRoute from '../../components/user/user.route';
import timezoneRoute from '../../components/timezone/timezone.route';
import languageRoute from '../../components/language/language.route';
import teachingLanguageRoute from '../../components/teachingLanguage/teachingLanguage.route';
import categoryRoute from '../../components/category/category.route';
import courseRoute from '../../components/course/course.route';
import intakeRoute from '../../components/course/intake.route';
import unitRoute from '../../components/unit/unit.route';
import userCourseRoute from '../../components/userCourse/userCourse.route';
import fileRoute from '../../components/file/file.route';
import userFileRoute from '../../components/file/userFile.route';
import questionRoute from '../../components/question/question.route';
import userQuestionRoute from '../../components/question/userQuestion.route';
import surveyRoute from '../../components/survey/survey.route';
import userRoleRoute from '../../components/userRole/userRole.route';
import userTypeRoute from '../../components/userType/userType.route';
import userTypeUnitRoute from '../../components/userTypeUnit/userTypeUnit.route';
import userEventRoute from '../../components/userEvent/userEvent.route';
import groupRoute from '../../components/group/group.route';
import zoomRoute from '../../components/zoom/zoom.route';
import reportRoute from '../../components/report/report.route';
import locationRoute from '../../components/location/location.route';
import userLocationRoute from '../../components/location/userLocation.route';
import courseRulesAndPathRoute from '../../components/courseRulesAndPath/courseRulesAndPath.route';
import roomRoute from '../../components/room/room.route';
import courseUserRoute from '../../components/courseUser/courseUser.route';
import sessionUserRoute from '../../components/sessionUser/sessionUser.route';
import classroomSessionRoute from '../../components/classroomSession/classroomSession.route';
import userReportRoute from '../../components/userReport/userReport.route';
import courseReportRoute from '../../components/courseReport/courseReport.route';
import discussionRoute from '../../components/discussion/discussion.route';
import discussionCommentRoute from '../../components/discussion/discussionComment.route';
import notificationRoute from '../../components/notification/notificaition.route';
import chatGroupRoute from '../../components/chatGroup/chatGroup.route';
import chatMessageRoute from '../../components/chatMessage/chatMessage.route';
import userSetting from '../../components/userSetting/userSetting.route';
import courseGroup from '../../components/courseGroup/courseGroup.route';
import userCourseGroup from '../../components/courseGroup/userCourseGroup.route';
import Logs from '../../components/logs/logs.route';
import AdminRoute from '../../components/admin/admin.route';

const router = new Router();
router.use('/users', [userRoute]);
router.use('/timezones', [timezoneRoute]);
router.use('/languages', [languageRoute]);
router.use('/teaching-languages', [teachingLanguageRoute]);
router.use('/categories', [categoryRoute]);
router.use('/courses', [courseRoute]);
router.use('/intakes', [intakeRoute]);
router.use('/units', [unitRoute]);
router.use('/user-courses/', [userCourseRoute]);
router.use('/files', [fileRoute]);
router.use('/users-file', [userFileRoute]);
router.use('/questions', [questionRoute]);
router.use('/user-questions', [userQuestionRoute]);
router.use('/surveys', [surveyRoute]);
router.use('/user-roles', [userRoleRoute]);
router.use('/user-types', [userTypeRoute]);
router.use('/user-type-units', [userTypeUnitRoute]);
router.use('/user-events', [userEventRoute]);
router.use('/groups', [groupRoute]);
router.use('/rooms', [roomRoute]);
router.use('/course-users', [courseUserRoute]);
router.use('/session-users', [sessionUserRoute]);
router.use('/classroom-sessions', [classroomSessionRoute]);
router.use('/zooms', [zoomRoute]);
router.use('/report', [reportRoute]);
router.use('/course-rules-and-path', [courseRulesAndPathRoute]);
router.use('/reports', [userReportRoute, courseReportRoute]);
router.use('/locations', locationRoute);
router.use('/user-locations', userLocationRoute);
router.use('/discussions', discussionRoute);
router.use('/discussions-comment', discussionCommentRoute);
router.use('/notifications', notificationRoute);
router.use('/settings', userSetting);
router.use('/chat', [chatGroupRoute, chatMessageRoute]);
router.use('/course-groups', courseGroup);
router.use('/user-course-groups', userCourseGroup);
router.use('/logs', Logs);
router.use('/admin', AdminRoute);

// Docs
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'staging') {
  router.use(morgan(MORGAN_FORMAT, {
    skip: (req, res) => {
      if (req.originalUrl.includes('api-docs')) {
        return true;
      }
      return res.statusCode < 400;
    },
    stream: process.stderr,
  }));
  router.use(morgan(MORGAN_FORMAT, {
    skip: (req, res) => {
      if (req.originalUrl.includes('api-docs')) {
        return true;
      }
      return res.statusCode >= 400;
    },
    stream: process.stdout,
  }));
  router.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpecV1));
} else {
  router.use(morgan(MORGAN_FORMAT, {
    skip: (req, res) => res.statusCode < 400,
    stream: process.stderr,
  }));
  router.use(morgan(MORGAN_FORMAT, {
    skip: (req, res) => res.statusCode >= 400,
    stream: process.stdout,
  }));
}
export default router;
