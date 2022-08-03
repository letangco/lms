import * as LogsService from './logs.service';
import {EVENT_LOGS, EVENT_LOGS_TYPE} from '../../constants';
import { checkUserTypeIsAdmin } from "../userType/userType.service";

export async function getLogs(req, res, next) {
  try {
    await checkUserTypeIsAdmin(req.auth?.type);
    const { query } = req;
    const logs = await LogsService.getLogs(query, req.auth);
    return res.json({
      success: true,
      payload: logs,
    });
  } catch (error) {
    return next(error);
  }
}

export async function undoEvent(req, res, next) {
  try {
    await checkUserTypeIsAdmin(req.auth?.type);
    const { query } = req;
    const logs = await LogsService.undoEvent(query, req.auth);
    return res.json({
      success: true,
      payload: logs,
    });
  } catch (error) {
    return next(error);
  }
}

export async function cleanLogs(req, res, next) {
  try {
    await checkUserTypeIsAdmin(req.auth?.type);
    const logs = await LogsService.cleanLogs();
    return res.json({
      success: true,
      payload: logs?.deletedCount,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getEventList(req, res, next) {
  try {
    await checkUserTypeIsAdmin(req.auth?.type);
    return res.json({
      success: true,
      payload: EVENT_LOGS,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getEventType(req, res, next) {
  try {
    await checkUserTypeIsAdmin(req.auth?.type);
    return res.json({
      success: true,
      payload: EVENT_LOGS_TYPE,
    });
  } catch (error) {
    return next(error);
  }
}

