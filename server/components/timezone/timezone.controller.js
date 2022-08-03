import * as TimezoneService from './timezone.service';

export async function getTimezones(req, res, next) {
  try {
    const timezones = await TimezoneService.getTimezones();
    return res.json({
      success: true,
      payload: timezones,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deactivateTimezone(req, res, next) {
  try {
    const {
      id,
    } = req.params;
    await TimezoneService.deactivateTimezone(id);
    return res.json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
}

export async function activateTimezone(req, res, next) {
  try {
    const {
      id,
    } = req.params;
    await TimezoneService.activateTimezone(id);
    return res.json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
}
