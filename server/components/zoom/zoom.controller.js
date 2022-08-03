import * as ZoomService from './zoom.service';
import * as ZoomConfigService from './zoomConfig.service';

export async function notifications(req, res, next) {
  try {
    ZoomService.addZoomHook(req.body);
    return res.sendStatus(200);
  } catch (error) {
    return next(error);
  }
}


export async function createZoom(req, res, next) {
  try {
    const zoom = await ZoomConfigService.createZoom(req.body);
    return res.json({
      success: true,
      payload: zoom,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getZooms(req, res, next) {
  try {
    const zooms = await ZoomConfigService.getZooms(req.query);
    return res.json({
      success: true,
      payload: zooms,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteZoom(req, res, next) {
  try {
    const {
      id,
    } = req.params;
    await ZoomConfigService.deleteZoom(id);
    return res.json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getZoom(req, res, next) {
  try {
    const {
      id,
    } = req.params;
    const zoom = await ZoomConfigService.getZoom(id);
    return res.json({
      success: true,
      payload: zoom,
    });
  } catch (error) {
    return next(error);
  }
}
export async function updateZoom(req, res, next) {
  try {
    const zoom = await ZoomConfigService.updateZoom(req.params.id, req.body);
    return res.json({
      success: true,
      payload: zoom,
    });
  } catch (error) {
    return next(error);
  }
}
