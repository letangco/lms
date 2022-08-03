import { v4 as uuidV4 } from 'uuid';
import logger from '../../util/logger';
import { getUrlForRoomCall, roomRequest } from './room.util';
import * as UserEventService from '../userEvent/userEvent.service';
import * as UserSettingService from '../userSetting/userSetting.service';
import UserSetting from '../userSetting/userSetting.model';
import {
  ROOM_ORIGIN_VERSION,
  ROOM_ORIGIN_SERVER_NAME,
  ROOM_LOGOUT_BASE_URL,
  ROOM_HOOK_CALLBACK_URL,
} from '../../config';
import APIError from '../../util/APIError';
import {
  NOTIFICATION_EVENT,
  ROOM_GUEST_POLICY,
  ROOM_VIEWER_ROLES, UNIT_STATUS,
  USER_EVENT_STATUS,
  USER_EVENT_TYPE, USER_ROLES, USER_STATUS,
} from '../../constants';
import {
  handleHook,
  handleRecordedHook,
  handleScreenRecordedHook,
  registryHook,
} from './room.hook';
import { formatNotification, getNotificationByKey } from '../notification/notificaition.service';
import SessionUser from '../sessionUser/sessionUser.model';
import * as UserService from '../user/user.service';
import { getUnitByConditions, getUnitById } from '../unit/unit.service';
import { getCourseById } from '../course/course.service';
import { getUserType, getUserTypeByConditions } from "../userType/userType.service";
import { getCourseUserRole } from '../courseUser/courseUser.service';

/**
 * Create meeting
 * The meeting is available before 5 minutes after created, this duration config able
 * @param params
 * @param {String} params.name A name for the meeting
 * @param {String} params.meetingID A meeting ID that can be used to identify this meeting
 * @param {String|optional} params.moderatorPW The password that will join URL can later provide as its password parameter to indicate the user will as a moderator.
 *                           If no moderatorPW is provided, create will return a randomly generated moderatorPW password for the meeting.
 * @param {String|optional} params.attendeePW The password that the join URL can later provide as its password parameter to indicate the user will join as a viewer.
 *                          If no attendeePW is provided, the create call will return a randomly generated attendeePW password for the meeting.
 * @param {String|optional} params.logoutURL The URL that the BigBlueButton client will go to after users click the OK button on the ‘You have been logged out message’
 * @param {String|optional} params.logo Setting logo=http://www.example.com/my-custom-logo.png will replace the default logo in the html5 client. (added 2.0)
 * @param {String|optional} params.mobileLogo Setting logo=http://www.example.com/my-custom-mobile-logo.png will replace the default logo on mobile UI in the html5 client. (added 2.0)
 * @param {String|optional} params.favicon Setting logo=http://www.example.com/my-custom-favicon.png will replace the default favicon html5 client. (added 2.0)
 * @param {String|optional} params.playbackLogo Logo load before the slide (added 2.0)
 * @param {String|optional} params.playbackCopyright The copyright when playback recorded presentation (added 2.0)
 * @param {String|optional} params.preSlide The slide display for first load
 * @param {String|optional} params.welcome A welcome message that gets displayed on the chat window when the participant joins.
 * @param {String|optional} params.clientTitle Custom html5 favicon
 * @param {Boolean|optional} params.muteOnStart Setting muteOnStart=true will mute all users when the meeting starts
 * @param {String|optional} params.guestPolicy Will set the guest policy for the meeting. The guest policy determines whether or not users who send a join request with guest=true will be allowed to join the meeting
 * @param {Boolean|optional} params.autoStartRecording User setting auto record or not
 * @param {Boolean|optional} params.allowStartStopRecording User can control start/stop record
 * @returns {Promise<null|{duration: *, hasBeenForciblyEnded: boolean, moderatorPW: *, moderatorCount: *, hasUserJoined: boolean, participantCount: *, attendeePW: *, meetingID: *, internalMeetingID: *}>}
 */
export async function createMeeting(params) {
  try {
    const apiOptions = {
      method: 'POST',
      uri: getUrlForRoomCall('create', {
        name: params.name,
        meetingID: params.meetingID,
        moderatorPW: params.moderatorPW,
        attendeePW: params.attendeePW,
        'meta_bbb-origin-version': ROOM_ORIGIN_VERSION,
        'meta_bbb-origin-server-name': ROOM_ORIGIN_SERVER_NAME,
        'meta_playback-logo-url': params.playbackLogo,
        'meta_playback-copyright': params.playbackCopyright,
        'meta_html5-mobile-logo': params.mobileLogo,
        'meta_html5-client-title': params.clientTitle,
        'meta_html5-client-favicon': params.favicon,
        autoStartRecording: params.autoStartRecording,
        allowStartStopRecording: params.allowStartStopRecording,
        muteOnStart: params.muteOnStart,
        guestPolicy: params.guestPolicy,
        record: true,
        logoutURL: params.logoutURL || ROOM_LOGOUT_BASE_URL,
        logo: params.logo,
        welcome: params.welcome,
        copyright: 'LMS - Edutek',
      }),
      json: false,
    };
    if (params.preSlide) {
      apiOptions.body = `
        <modules>
          <module name="presentation">
            <document url="${params.preSlide}" filename="pre-slide.pdf"/>
          </module>
        </modules>
      `;
      apiOptions.headers = {
        'Content-Type': 'application/xml',
      };
    }
    const meeting = await roomRequest(apiOptions);
    if (!meeting.meetingID) {
      return null;
    }
    return {
      meetingID: meeting.meetingID,
      internalMeetingID: meeting.internalMeetingID,
      attendeePW: meeting.attendeePW,
      moderatorPW: meeting.moderatorPW,
      hasUserJoined: meeting.hasUserJoined === 'true',
      duration: Number.parseInt(meeting.duration, 10),
      hasBeenForciblyEnded: meeting.hasBeenForciblyEnded === 'true',
      moderatorCount: Number.parseInt(meeting.moderatorCount || 0, 10),
      participantCount: Number.parseInt(meeting.participantCount || 0, 10),
    };
  } catch (error) {
    logger.error('RoomService createMeeting, error:');
    logger.error(error);
    throw error;
  }
}

/**
 * Get meeting info
 * @param params
 * @param {String} params.meetingID A meeting ID that can be used to identify this meeting
 * @param {String} params.endpoint Server endpoint
 * @returns {Promise.<{}>}
 */
export async function getMeetingInfo(params) {
  try {
    const apiOptions = {
      method: 'GET',
      uri: getUrlForRoomCall('getMeetingInfo', {
        meetingID: params.meetingID,
      }, true, params.endpoint),
    };
    const meeting = await roomRequest(apiOptions);
    if (meeting.returncode === 'FAILED') {
      return null;
    }
    return {
      meetingID: meeting.meetingID,
      internalMeetingID: meeting.internalMeetingID,
      attendeePW: meeting.attendeePW,
      moderatorPW: meeting.moderatorPW,
      hasUserJoined: meeting.hasUserJoined === 'true',
      duration: Number.parseInt(meeting.duration, 10),
      hasBeenForciblyEnded: meeting.hasBeenForciblyEnded === 'true',
      moderatorCount: Number.parseInt(meeting.moderatorCount || 0, 10),
      participantCount: Number.parseInt(meeting.participantCount || 0, 10),
    };
  } catch (error) {
    logger.error('RoomService getMeetingInfo, error:');
    logger.error(error);
    throw error;
  }
}

/**
 * Get instructor or learner join url
 * @param user
 * @param user._id
 * @param user.fullName
 * @param userEventId
 * @param params
 * @param params.accessCode
 * @returns {Promise.<{}>}
 */
export async function getUserEventJoinUrl(user, userEventId, params) {
  try {
    const userEvent = await UserEventService.getUserEvent({
      _id: userEventId,
      type: USER_EVENT_TYPE.WEBINAR,
      status: USER_EVENT_STATUS.ACTIVE,
    }, [
      {
        path: 'unit',
        select: 'course',
      },
    ]);
    if (!userEvent) {
      return Promise.reject(new APIError(404, 'User event not found'));
    }
    if (!user._id || !userEvent._id) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'User and user event is required',
          param: 'userAndUserEventIsRequired',
        },
      ]));
    }
    const userType = await getUserTypeByConditions({ _id: user.type });
    let canStart = false;
    if (userEvent?.instructor?.toString() === user?._id?.toString()
        || (
            userType
            && [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].some(role=> userType?.roles?.includes(role))
        )
    ) {
      canStart = true;
    } else {
      const unitInfo = await getUnitByConditions({
        _id: userEvent?.unit,
        status: UNIT_STATUS.ACTIVE
      });
      const userRole = await getCourseUserRole(unitInfo?.course, user?._id);
      if (userRole === USER_ROLES.INSTRUCTOR) {
        canStart = true;
      }
    }
    // const isInstructor = await UserEventService.isInstructor(user._id, userEvent._id);
    // Check access code for event have been set access code and user is not instructor
    if (!canStart && (userEvent?.settings?.accessCode && (params.accessCode !== userEvent.settings.accessCode))) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'The access code is not match',
          param: 'accessCodeNotMatch',
        },
      ]));
    }

    const userPermission = canStart ? ROOM_VIEWER_ROLES.MODERATOR : ROOM_VIEWER_ROLES.VIEWER;
    if (Object.values(ROOM_VIEWER_ROLES).indexOf(userPermission) < 0) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Permission denied',
          param: 'permissionDenied',
        },
      ]));
    }
    // Get meeting
    let meeting;
    meeting = await getMeetingInfo({
      meetingID: userEvent._id,
    });
    if (userPermission === ROOM_VIEWER_ROLES.MODERATOR || userEvent?.settings?.anyUserCanStart) {
      // Get creator room settings
      const userSetting = await UserSetting.findOne({ userId: userEvent.creator });
      if (!meeting?.meetingID) {
        const userSettingValidated = UserSettingService.validateUserSetting(userSetting);
        const logOutUrl = userEvent?.unit?.course ? `${ROOM_LOGOUT_BASE_URL}/course/${userEvent.unit.course}` : ROOM_LOGOUT_BASE_URL;
        meeting = await createMeeting({
          name: userEvent.name,
          meetingID: userEvent._id,
          logoutURL: logOutUrl,
          logo: userSettingValidated.logo,
          mobileLogo: userSettingValidated.mobileLogo,
          favicon: userSettingValidated.favicon,
          clientTitle: userSettingValidated.clientTitle,
          playbackLogo: userSettingValidated.playbackLogo,
          playbackCopyright: userSettingValidated.playbackCopyright,
          preSlide: userSettingValidated.preSlide,
          welcome: userSettingValidated.welcome,
          autoStartRecording: false,
          allowStartStopRecording: true,
          muteOnStart: userEvent?.settings?.muteOnStart ?? false,
          guestPolicy: userEvent?.settings?.requireModeratorApprove === true ? ROOM_GUEST_POLICY.ASK_MODERATOR : ROOM_GUEST_POLICY.ALWAYS_ACCEPT,
        });
      }
      if (meeting) {
        await registryHook({
          callbackURL: `${ROOM_HOOK_CALLBACK_URL}?meetingID=${meeting.meetingID}&internalMeetingID=${meeting.internalMeetingID}`,
          meetingID: meeting.meetingID,
          internalMeetingID: meeting.internalMeetingID,
        });
        const notifications = await getNotificationByKey(NOTIFICATION_EVENT.EVENT_STARTED);
        if (JSON.stringify(notifications) !== '{}') {
          const event = await UserEventService.getUserEvent({
            _id: userEventId,
            status: USER_STATUS.ACTIVE
          });
          if (event) {
            const users = await SessionUser.find({
              session: userEventId
            });
            if (users?.map) {
              await Promise.all(users.map(async (user) => {
                const userInfo = await UserService.getUser(user.user);
                const type = await getUserType(userInfo.type);
                const notification = notifications[type?.systemRole] || notifications.ALL;
                if (userInfo && notification) {
                  const unitInfo = await getUnitById(event.unit);
                  const courseInfo = unitInfo ? await getCourseById(unitInfo.course) : {};
                  await formatNotification(notification, {
                    userInfo: {
                      firstName: userInfo.firstName,
                      lastName: userInfo.lastName,
                      fullName: userInfo.fullName,
                      email: userInfo.email,
                    },
                    courseInfo,
                    unitInfo,
                    eventInfo: event,
                    email: userInfo.email
                  });
                }
              }));
            }
          }
        }
      }
    }
    if (!meeting) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Class is not started yet by the Instructor.',
          param: 'meetingNotFound',
        },
      ]));
    }
    const meetingPassword = (userPermission === ROOM_VIEWER_ROLES.MODERATOR || userEvent?.settings?.anyUserCanJoinAsModerator) ? meeting?.moderatorPW : meeting?.attendeePW;
    if (!meetingPassword) {
      return Promise.reject(new APIError(403, [
        {
          msg: 'Meeting is not valid',
          param: 'meetingNotValid',
        },
      ]));
    }
    const apiOptions = {
      method: 'GET',
      uri: getUrlForRoomCall('join', {
        fullName: user.fullName,
        meetingID: userEvent._id,
        password: meetingPassword,
        userID: user._id || uuidV4(),
        redirect: false,
      }),
    };
    const joinResponse = await roomRequest(apiOptions);
    if (joinResponse?.url) {
      return joinResponse?.url;
    }
    return Promise.reject(new APIError(403, {
      msg: 'Join URL not found',
      param: 'joinUrlNotFound',
    }));
  } catch (error) {
    logger.error('RoomService getJoinUrl, error:');
    logger.error(error);
    throw error;
  }
}

export async function callRoomHook(data) {
  try {
    await handleHook(data);
    return true;
  } catch (error) {
    logger.error('RoomService callRoomHook, error:');
    logger.error(error);
    throw error;
  }
}

export async function callRoomRecordedHook(data) {
  try {
    await handleRecordedHook(data);
    return true;
  } catch (error) {
    logger.error('RoomService callRoomRecordedHook, error:');
    logger.error(error);
    throw error;
  }
}

export async function callRoomScreenRecordedHook(data) {
  try {
    await handleScreenRecordedHook(data);
    return true;
  } catch (error) {
    logger.error('RoomService callRoomScreenRecordedHook, error:');
    logger.error(error);
    throw error;
  }
}
