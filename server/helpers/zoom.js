import logger from '../util/logger';
import APIError from '../util/APIError';
const jwt = require('jsonwebtoken');
const rp = require('request-promise');
import { buildUriByQuery } from './string.helper';
let zoom_client = '';

export async function callZoomApi(options) {
  try {
    return await rp(options)
      .then(async function (response) {
        return response;
      })
      .catch(function (err) {
        return Promise.reject(new APIError(err.statusCode || 400, [{
          msg: err?.error?.message ? `Zoom api: ${err?.error?.message}` : 'Cannot create zoom meeting',
          param: 'zoomError'
        }]));
      });
  } catch (error) {
    throw error;
  }
}

export async function getTokenZoomApi(zoom) {
  try {
    if (typeof zoom === 'object') {
      if (zoom === null) {
        return '';
      }
      const zoom_key = zoom?.zoom_key || '';
      const zoom_sec = zoom?.zoom_sec || '';
      zoom_client = zoom?.zoom_client || '';
      const payload = {
        iss: zoom_key,
        exp: ((new Date()).getTime() + 5000)
      };
      return jwt.sign(payload, zoom_sec);
    }
  } catch (error) {
    throw error;
  }
}

export function getMethodZoom(type, meetingId = '') {
  switch (type) {
    case 'CREATE_MEETING':
    case 'GET_MEETINGS':
      return `https://api.zoom.us/v2/users/${zoom_client}/meetings`;
    case 'GET_MEETING':
    case 'UPDATE_MEETING':
    case 'DELETE_MEETING':
      return `https://api.zoom.us/v2/meetings/${meetingId}`;
    case 'UPDATE_STATUS':
      return `https://api.zoom.us/v2/meetings/${meetingId}/status`;
    case 'ADD_REGISTRANT':
    case 'GET_REGISTRANT':
      return `https://api.zoom.us/v2/meetings/${meetingId}/registrants`;
    case 'UPDATE_REGISTRANT':
      return `https://api.zoom.us/v2/meetings/${meetingId}/registrants/status`;
      case 'REPORT_MEETING':
      return `https://api.zoom.us/v2/report/meetings/${meetingId}`;
      case 'REPORT_PARTICIPANTS':
        return `https://api.zoom.us/v2/report/meetings/${meetingId}/participants?page_size=300`;
      case 'REPORT_RECORDING':
      return `https://api.zoom.us/v2/meetings/${meetingId}/recordings`;
    default:
      return '';
  }
}
export async function createScheduleZoom(data, creator) {
  const bearer = await getTokenZoomApi(creator);
  try {
    let uri = getMethodZoom(data.uri);
    if (data.query) {
      uri = buildUriByQuery(uri, data.query);
    }
    const options = {
      uri,
      qs: {
        status: 'active'
      },
      auth: {
        bearer
      },
      headers: {
        'User-Agent': 'Zoom-api-Jwt-Request',
        'content-type': 'application/json'
      },
      json: true,
      method: data?.method || 'GET',
      body: data?.body || {}
    };
    return await callZoomApi(options);
  } catch (error) {
    throw error;
  }
}

export async function getMeetingsZoom(data, zoom) {
  const bearer = await getTokenZoomApi(zoom);
  try {
    let uri = getMethodZoom(data.uri);
    if (data.params) {
      uri = buildUriByQuery(uri, data.params);
    }
    const options = {
      uri,
      qs: {
        status: 'active'
      },
      auth: {
        bearer
      },
      headers: {
        'User-Agent': 'Zoom-api-Jwt-Request',
        'content-type': 'application/json'
      },
      json: true,
      method: data?.method || 'GET',
      body: data?.body || {}
    };
    return await callZoomApi(options);
  } catch (error) {
    throw error;
  }
}
export async function getMeetingZoom(id, data, zoom) {
  const bearer = await getTokenZoomApi(zoom);
  try {
    let uri = getMethodZoom(data.uri, id);
    if (data.params) {
      uri = buildUriByQuery(uri, data.params);
    }
    const options = {
      uri,
      qs: {
        status: 'active'
      },
      auth: {
        bearer
      },
      headers: {
        'User-Agent': 'Zoom-api-Jwt-Request',
        'content-type': 'application/json'
      },
      json: true,
      method: data?.method || 'GET'
    };
    return await callZoomApi(options);
  } catch (error) {
    throw error;
  }
}

export async function updateScheduleZoom(id, data, creator) {
  const bearer = await getTokenZoomApi(creator);
  try {
    let uri = getMethodZoom(data.uri, id);
    if (data.query) {
      uri = buildUriByQuery(uri, data.query);
    }
    const options = {
      uri,
      qs: {
        status: 'active'
      },
      auth: {
        bearer
      },
      headers: {
        'User-Agent': 'Zoom-api-Jwt-Request',
        'content-type': 'application/json'
      },
      json: true,
      method: data?.method || 'GET',
      body: data?.body || {}
    };
    return await callZoomApi(options);
  } catch (error) {
    logger.error('updateScheduleZoom error:', error);
    throw error;
  }
}

export async function deleteScheduleZoom(id, data, creator) {
  const bearer = await getTokenZoomApi(creator);
  try {
    let uri = getMethodZoom(data.uri, id);
    if (data.query) {
      uri = buildUriByQuery(uri, data.query);
    }
    const options = {
      uri,
      qs: {
        status: 'active'
      },
      auth: {
        bearer
      },
      headers: {
        'User-Agent': 'Zoom-api-Jwt-Request',
        'content-type': 'application/json'
      },
      json: true,
      method: data?.method || 'GET',
      body: data?.body || {}
    };
    return await callZoomApi(options);
  } catch (error) {
    logger.error('deleteScheduleZoom error:', error);
    throw error;
  }
}
export async function addScheduleRegistrantZoom(id, data, creator) {
  const bearer = await getTokenZoomApi(creator);
  try {
    let uri = getMethodZoom(data.uri, id);
    if (data.query) {
      uri = buildUriByQuery(uri, data.query);
    }
    const options = {
      uri,
      qs: {
        status: 'active'
      },
      auth: {
        bearer
      },
      headers: {
        'User-Agent': 'Zoom-api-Jwt-Request',
        'content-type': 'application/json'
      },
      json: true,
      method: data?.method || 'GET',
      body: data?.body || {}
    };
    return await callZoomApi(options);
  } catch (error) {
    logger.error('addScheduleRegistrantZoom error:', error);
    throw error;
  }
}

export async function getScheduleRegistrantZoom(id, data) {
  try {
    let uri = getMethodZoom(data.uri, id);
    if (data.query) {
      uri = buildUriByQuery(uri, data.query);
    }
    const options = {
      uri,
      qs: {
        status: 'active'
      },
      auth: {
        bearer: ''
      },
      headers: {
        'User-Agent': 'Zoom-api-Jwt-Request',
        'content-type': 'application/json'
      },
      json: true,
      method: data?.method || 'GET',
      body: data?.body || {}
    };
    return await callZoomApi(options);
  } catch (error) {
    logger.error('getScheduleRegistrantZoom error:', error);
    throw error;
  }
}

export async function updateScheduleRegistrantZoom(id, data, creator) {
  const bearer = await getTokenZoomApi(creator);
  try {
    let uri = getMethodZoom(data.uri, id);
    if (data.query) {
      uri = buildUriByQuery(uri, data.query);
    }
    const options = {
      uri,
      qs: {
        status: 'active'
      },
      auth: {
        bearer
      },
      headers: {
        'User-Agent': 'Zoom-api-Jwt-Request',
        'content-type': 'application/json'
      },
      json: true,
      method: data?.method || 'GET',
      body: data?.body || {}
    };
    return await callZoomApi(options);
  } catch (error) {
    logger.error('updateScheduleRegistrantZoom error:', error);
    throw error;
  }
}

export async function getReportMeetingZoom(id, data, creator) {
  const bearer = await getTokenZoomApi(creator);
  try {
    let uri = getMethodZoom(data.uri, id);
    if (data.query) {
      uri = buildUriByQuery(uri, data.query);
    }
    const options = {
      uri,
      qs: {
        status: 'active'
      },
      auth: {
        bearer
      },
      headers: {
        'User-Agent': 'Zoom-api-Jwt-Request',
        'content-type': 'application/json'
      },
      json: true,
      method: data?.method || 'GET',
      body: data?.body || {}
    };
    return await callZoomApi(options);
  } catch (error) {
    logger.error('getReportMeetingZoom error:', error);
    throw error;
  }
}

export async function getReportMeetingParticipantsZoom(id, data, creator) {
  const bearer = await getTokenZoomApi(creator);
  try {
    let uri = getMethodZoom(data.uri, id);
    if (data.query) {
      uri = buildUriByQuery(uri, data.query);
    }
    const options = {
      uri,
      qs: {
        status: 'active'
      },
      auth: {
        bearer
      },
      headers: {
        'User-Agent': 'Zoom-api-Jwt-Request',
        'content-type': 'application/json'
      },
      json: true,
      method: data?.method || 'GET',
      body: data?.body || {}
    };
    return await callZoomApi(options);
  } catch (error) {
    logger.error('getReportMeetingParticipantsZoom error:', error);
    throw error;
  }
}

export async function getReportMeetingRecordingZoom(id, data, creator) {
  const bearer = await getTokenZoomApi(creator);
  try {
    let uri = getMethodZoom(data.uri, id);
    if (data.query) {
      uri = buildUriByQuery(uri, data.query);
    }
    const options = {
      uri,
      qs: {
        status: 'active'
      },
      auth: {
        bearer
      },
      headers: {
        'User-Agent': 'Zoom-api-Jwt-Request',
        'content-type': 'application/json'
      },
      json: true,
      method: data?.method || 'GET',
      body: data?.body || {}
    };
    return await callZoomApi(options);
  } catch (error) {
    // logger.error('getReportMeetingRecordingZoom error:', error);
    throw error;
  }
}
