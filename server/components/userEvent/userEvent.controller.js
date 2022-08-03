import * as UserEventService from './userEvent.service';
import {checkUserTypeIsAdmin} from "../userType/userType.service";

export async function getUserEvents(req, res, next) {
  try {
    const {
      auth,
    } = req;
    const {
      begin,
      end,
      types,
      unit,
    } = req.query;
    const data = await UserEventService.getUserEvents(auth, {
      begin,
      end,
      types,
      unit,
    });
    return res.json({
      success: true,
      payload: data,
    });
  } catch (error) {
    return next(error);
  }
}
export async function getUserEventsLive(req, res, next) {
  try {
    const {
      auth,
    } = req;
    const {
      query
    } = req;
    // await checkUserTypeIsAdmin(auth?.type);
    const data = await UserEventService.getUserEventsLive(query);
    return res.json({
      success: true,
      payload: data,
    });
  } catch (error) {
    return next(error);
  }
}
export async function getUsersEvent(req, res, next) {
  try {
    const {
      auth,
    } = req;
    const {
      query, params
    } = req;
    // await checkUserTypeIsAdmin(auth?.type);
    const data = await UserEventService.getUsersEvent(params.id, query);
    return res.json({
      success: true,
      payload: data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getUserEvent(req, res, next) {
  try {
    const data = await UserEventService.getUserEventDetail(req.auth, req.params.id);
    return res.json({
      success: true,
      payload: data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function createUserEvent(req, res, next) {
  try {
    const {
      auth,
      body,
    } = req;
    const data = await UserEventService.createUserEvent(auth, body);
    return res.json({
      success: true,
      payload: data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateUserEvent(req, res, next) {
  try {
    const {
      auth,
      body,
    } = req;
    await UserEventService.updateUserEvent(auth, req.params.id, body);
    return res.json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteUserEvent(req, res, next) {
  try {
    const {
      auth,
    } = req;
    await UserEventService.deleteUserEvent(auth._id, req.params.id);
    return res.json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
}

export async function joinUserEvent(req, res, next) {
  try {
    const {
      auth,
    } = req;
    return res.json({
      success: true,
      data: await UserEventService.joinUserEvent(auth, req.params.id)
    });
  } catch (error) {
    return next(error);
  }
}

export async function eventDetail(req, res, next) {
  try {
    const {
      auth,
    } = req;
    return res.json({
      success: true,
      data: await UserEventService.eventDetail(auth, req.params.id)
    });
  } catch (error) {
    return next(error);
  }
}

export async function playbackUserEvent(req, res, next) {
  try {
    const {
      auth,
    } = req;
    return res.json({
      success: true,
      data: await UserEventService.reportUserEvent(auth, req.params.id)
    });
  } catch (error) {
    return next(error);
  }
}

export async function reportParticipantUserEvent(req, res, next) {
  try {
    const {
      auth
    } = req;
    return res.json({
      success: true,
      data: await UserEventService.reportParticipantUserEvent(auth, req.params.id)
    });
  } catch (error) {
    return next(error);
  }
}


export async function getEventHistories(req, res, next) {
  try {
    const {
      auth
    } = req;
    return res.json({
      success: true,
      data: await UserEventService.getEventHistories(req.params.id)
    });
  } catch (error) {
    return next(error);
  }
}
