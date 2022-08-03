import logger from '../../util/logger';
import Zoom from './zoom.model';
import ZoomConfig from './zoomConfig.model';
import UserZoom from './userZoom.model';
import ZoomEvent from './zoomEvent.model';
import {
  createScheduleZoom,
  getMeetingsZoom,
  updateScheduleZoom,
  addScheduleRegistrantZoom,
  updateScheduleRegistrantZoom,
  getReportMeetingZoom,
  getMeetingZoom,
  getReportMeetingRecordingZoom
} from '../../helpers/zoom';
import { addRecordZoomToUserEvent } from '../userEvent/userEvent.service';
import APIError from '../../util/APIError';
import UserEvent from '../userEvent/userEvent.model';
import {
  DEFAULT_PAGE_LIMIT,
  NOTIFICATION_EVENT,
  ROOM_STATUS,
  ZOOM_EVENT,
  USER_ROOM_STATUS,
  REDIS_KEYS, ZOOM_STATUS_LIVE, USER_ZOOM_STATUS_LIVE, EVENT_LOGS, EVENT_LOGS_TYPE, USER_ROLES
} from '../../constants';
import { formatNotification, getNotificationByKey } from '../notification/notificaition.service';
import SessionUser from '../sessionUser/sessionUser.model';
import * as UserService from '../user/user.service';
import { getUnitById } from '../unit/unit.service';
import { getCourseById } from '../course/course.service';
import { createUserEventViewTracking } from '../userEventViewTracking/userEventViewTracking.service';
import { deleteRedisInfo } from "../../helpers/redis";
import {getUserType} from "../userType/userType.service";
import {createLogs} from "../logs/logs.service";

export async function createZoomEvent(data) {
  try {
    return await Zoom.create({
      event: data.event,
      user: data.user,
      unit: data.unit,
      course: data.course,
      zoom: data.zoom,
      account: data.account
    });
  } catch (error) {
    logger.error('createZoomEvent error:', error);
    throw error;
  }
}
export async function createScheduleRoom(data, zoom, creator) {
  try {
    let time = new Date(data.time.end).getTime() - new Date(data.time.begin).getTime();
    if (time > 0) {
      time = time / 60 / 1000;
    } else {
      time = 45;
    }
    const body = {
      topic: data.name,
      type: 2,
      start_time: data.time.begin,
      duration: time,
      timezone: data.timezone,
      agenda: data.description,
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: false,
        watermark: true,
        use_pmi: false,
        approval_type: 1,
        audio: 'voip',
        auto_recording: 'cloud',
        close_registration: false,
        waiting_room: false,
        enforce_login: true,
        registration_type: 1,
        meeting_authentication: false,
        registrants_email_notification: false,
        allow_multiple_devices: true,
        show_share_button: false
      }
    };
    const schedule = await createScheduleZoom({
      uri: 'CREATE_MEETING',
      method: 'POST',
      body
    }, zoom);
    if (schedule && schedule.id) {
      await createZoomEvent({
        event: data._id,
        user: creator?._id,
        unit: data.unit,
        zoom: schedule,
        account: {
          zoom_client: zoom.zoom_client,
          zoom_key: zoom.zoom_key,
          zoom_sec: zoom.zoom_sec,
          zoom_webhook: zoom.zoom_webhook,
        }
      });
    }
    return schedule;
  } catch (error) {
    await UserEvent.deleteOne({ _id: data._id });
    throw error;
  }
}

export async function getScheduleEvent(event, user, type = '', zoom = {}) {
  try {
    if (JSON.stringify(zoom) === '{}') {
      const zooms = await Zoom.find({
        event
      }).sort({ _id: -1 }).limit(1);
      if (!zooms?.length) {
        return Promise.reject(new APIError(403, 'Class is not started yet by the Instructor.'));
      }
      zoom = zooms[0];
    }
    const registrant = await addScheduleRegistrant(zoom?.zoom?.id, user, zoom.account);
    if (registrant && registrant?.registrant_id) {

      const registrantInfo = await UserZoom.findOne({
        'zoom.registrant_id': registrant.registrant_id
      });
      if (registrantInfo) {
        await UserZoom.updateOne({
          'zoom.registrant_id': registrant.registrant_id
        }, { $set: {
          status: USER_ZOOM_STATUS_LIVE.WAITING
          } });
      } else {
        await UserZoom.create({
          event,
          user: user._id,
          email: user.email,
          zoom: registrant
        });
      }
      return registrant.join_url;
    }
    return Promise.reject(new APIError(401, 'Permission denied'));
  } catch (error) {
    logger.error('getScheduleEvent error:', error);
    throw error;
  }
}
export async function getZoomByConditions(conditions) {
  try {
    const zooms = await Zoom.find(conditions).limit(1).sort({ _id: -1 });
    return zooms?.length ? zooms[0] : {};
  } catch (error) {
    logger.error('getUsersZoomByConditions error:', error);
    throw error;
  }
}

export async function getTotalUsersZoomByConditions(conditions) {
  try {
    return await UserZoom.countDocuments(conditions);
  } catch (error) {
    logger.error('getTotalUsersZoomByConditions error:', error);
    throw error;
  }
}

export async function addScheduleRegistrant(id, user, creator) {
  try {
    const body = {
      email: user.email,
      first_name: user.firstName || 'First name',
      last_name: user.lastName || '',
      auto_approve: true
    };
    return await addScheduleRegistrantZoom(id, {
      uri: 'ADD_REGISTRANT',
      method: 'POST',
      body
    }, creator);
  } catch (error) {
    logger.error('addScheduleRegistrant error:', error);
    throw error;
  }
}

export async function zoomDetail(event, creator) {
  try {
    const zoom = await Zoom.findOne({
      event
    });
    if (!zoom) {
      return Promise.reject(new APIError(404, 'Zoom meeting not found'));
    }
    return await getReportMeetingZoom(zoom?.zoom?.id, {
      uri: 'REPORT_MEETING',
      method: 'GET'
    }, creator);
  } catch (error) {
    logger.error('zoomDetail error:', error);
    throw error;
  }
}

export async function addZoomHook(data) {
  try {
    await ZoomEvent.create(data);
    let zoom, promises;
    console.log('addZoomHook: ', data.event);
    console.log('addZoomHook: ', data.payload.object.id);
    switch (data.event) {
      case ZOOM_EVENT.started:
        zoom = await Zoom.findOne({
          'zoom.id': parseInt(data.payload.object.id),
          status: ROOM_STATUS.PENDING
        });
        if (zoom) {
          await deleteRedisInfo(`${REDIS_KEYS.ZOOM_ACCOUNT}-${zoom?.account?.zoom_client}`);
          promises = await Promise.all([
            Zoom.updateOne({
              'zoom.id': parseInt(data.payload.object.id)
            }, {
              $set: {
                status: ROOM_STATUS.LIVING,
                startTime: Date.now()
              }
            }),
            UserEvent.findOneAndUpdate({
              _id: zoom.event,
            }, { $set: {
              roomStatus: USER_ROOM_STATUS.RUNNING
            } }),
            ZoomConfig.updateOne({
              zoom_client: zoom?.account?.zoom_client,
            }, { $set: {
              statusLive: ZOOM_STATUS_LIVE.ONLINE
            } }),
            createLogs({
              event: EVENT_LOGS.STARTED_EVENT,
              type: EVENT_LOGS_TYPE.STARTED,
              user: zoom?.user,
              data: { event: zoom?.event }
            })
          ]);
          const event = promises[1];
          const notifications = await getNotificationByKey(NOTIFICATION_EVENT.EVENT_STARTED);
          if (JSON.stringify(notifications) !== '{}' && event) {
            const users = await SessionUser.find({
              session: event._id
            });
            const unitInfo = await getUnitById(event.unit);
            const courseInfo = unitInfo ? await getCourseById(unitInfo.course) : {};
            await Promise.all(users.map(async (user) => {
              const userInfo = await UserService.getUser(user.user);
              if (userInfo) {
                const type = await getUserType(userInfo.type);
                const notification = notifications[type?.systemRole] || notifications.ALL;
                if (notification) {
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
              }
            }));
            if (event?.instructor !== zoom?.user) {
              const notification = notifications[USER_ROLES.INSTRUCTOR] || notifications.ALL;
              if (notification) {
                const userInfo = await UserService.getUser(event?.instructor);
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
            }
          }
        }
        break;
      case ZOOM_EVENT.ended:
        zoom = await Zoom.findOne({
          'zoom.id': parseInt(data.payload.object.id),
          status: ROOM_STATUS.LIVING
        });
        if (zoom) {
          await deleteRedisInfo(`${REDIS_KEYS.ZOOM_ACCOUNT}-${zoom?.account?.zoom_client}`);
          promises = await Promise.all([
            Zoom.updateOne({
              'zoom.id': parseInt(data.payload.object.id)
            }, {
              $set: {
                status: ROOM_STATUS.STOP,
                endTime: Date.now()
              }
            }),
            UserEvent.updateOne({
              _id: zoom.event,
            }, { $set: {
                roomStatus: USER_ROOM_STATUS.ENDED
              } }),
            getReportMeetingRecordingZoom(data.payload.object.id, {
              uri: 'REPORT_PARTICIPANTS',
              method: 'GET'
            }, zoom.account),
            ZoomConfig.updateOne({
              zoom_client: zoom?.account?.zoom_client,
            }, { $set: {
                statusLive: ZOOM_STATUS_LIVE.OFFLINE
              } }),
            createLogs({
              event: EVENT_LOGS.ENDED_EVENT,
              type: EVENT_LOGS_TYPE.ENDED,
              user: zoom?.user,
              data: { event: zoom?.event }
            })
          ]);
          const participants = promises[2];
          if (participants?.participants) {
            participants.participants.map(async (participant) => {
              const user = await UserService.getUserByConditions({
                email: participant.user_email
              });
              if (user) {
                await createUserEventViewTracking({
                  event: zoom.event,
                  user: user._id,
                  internalMeetingId: zoom?.zoom?.id,
                  timeJoined: participant.join_time,
                  timeLeft: participant.leave_time,
                  duration: parseInt(participant.duration),
                });
              }
            });
          }
        }
        break;
      case ZOOM_EVENT.completed:
        zoom = await Zoom.findOne({
          'zoom.id': parseInt(data.payload.object.id)
        });
        if (zoom) {
          await deleteRedisInfo(`${REDIS_KEYS.ZOOM_ACCOUNT}-${zoom?.account?.zoom_client}`);
          await addRecordZoomToUserEvent(zoom.event, data.payload.object);
          if (zoom.status === ROOM_STATUS.LIVING) {
            await Promise.all([
              Zoom.updateOne({
                'zoom.id': parseInt(data.payload.object.id)
              }, {
                $set: {
                  status: ROOM_STATUS.STOP,
                  endTime: Date.now()
                }
              }),
              UserEvent.updateOne({
                _id: zoom.event,
              }, { $set: {
                  roomStatus: USER_ROOM_STATUS.ENDED
                } }),
              ZoomConfig.updateOne({
                zoom_client: zoom?.account?.zoom_client,
              }, { $set: {
                  statusLive: ZOOM_STATUS_LIVE.OFFLINE
                } })
            ]);
          }
        }
        break;
      case ZOOM_EVENT.joined:
        await UserZoom.updateMany({
          email: data?.payload?.object?.participant?.email,
          'zoom.id': parseInt(data?.payload?.object?.id),
        }, { $set: {
            status: USER_ZOOM_STATUS_LIVE.JOINED,
            'zoom.join_time': data?.payload?.object?.participant?.join_time
          } });
        break;
      case ZOOM_EVENT.left:
        await UserZoom.updateMany({
          email: data?.payload?.object?.participant?.email,
          'zoom.id': parseInt(data?.payload?.object?.id),
        }, { $set: {
            status: USER_ZOOM_STATUS_LIVE.LEFT,
            'zoom.leave_time': data?.payload?.object?.participant?.leave_time
          } });
        break;
      default:
        break;
    }
  } catch (error) {
    logger.error('addZoomHook error:', error);
    // throw error;
  }
}

export async function getZoomReport(event, creator) {
  try {
    const zoom = await Zoom.findOne({ event }).lean();
    if (!zoom) {
      return Promise.reject(new APIError(404, 'Event report not found'));
    }
    const records = await getReportMeetingRecordingZoom(zoom?.zoom?.id, {
      uri: 'REPORT_RECORDING',
      method: 'GET'
    }, creator);
    if (records && records?.recording_files?.length) {
      return records.recording_files.map(file => ({
          start_time: file.recording_start,
          end_time: file.recording_end,
          file_size: file.file_size,
          play_url: file.play_url,
          download_url: file.download_url,
          recording_type: file.recording_type,
        }));
    }
  } catch (error) {
    logger.error('getZoomReport error:', error);
    throw error;
  }
}

export async function getParticipantZoomReport(event, creator) {
  try {
    const zoom = await Zoom.findOne({ event }).lean();
    if (!zoom) {
      return Promise.reject(new APIError(404, 'Event report not found'));
    }
    return await getReportMeetingRecordingZoom(zoom?.zoom?.id, {
      uri: 'REPORT_PARTICIPANTS',
      method: 'GET'
    }, creator);
  } catch (error) {
    logger.error('getZoomReport error:', error);
    throw error;
  }
}

export async function getMeetingsRoom(params, zoom) {
  try {
    return await getMeetingsZoom({
      uri: 'GET_MEETINGS',
      method: 'GET',
      params,
    }, zoom);
  } catch (error) {
    logger.error('getZoomReport error:', error);
    throw error;
  }
}
export async function getMeetingRoom(id, creator) {
  try {
    return await getMeetingZoom(id, {
      uri: 'GET_MEETING',
      method: 'GET',
    }, creator);
  } catch (error) {
    logger.error('getZoomReport error:', error);
    throw error;
  }
}

export async function getMeetingZoomByConditions(conditions) {
  try {
    const zooms = await Zoom.find(conditions).sort({ _id: -1 }).limit(1);
    return zooms?.length ? zooms[0] : {}
  } catch (error) {
    logger.error('getMeetingsZoomByConditions error:', error);
    throw error;
  }
}

export async function getZoomReportByConditions(conditions, sort = { _id: -1 }, limit = DEFAULT_PAGE_LIMIT) {
  try {
    return await Zoom.find(conditions).sort(sort).limit(limit);
  } catch (error) {
    logger.error('getZoomReport error:', error);
    throw error;
  }
}
