import * as LocationService from './location.service';

export async function createLocation(req, res, next) {
  try {
    const location = await LocationService.createLocation(req.body);
    return res.json({
      success: true,
      payload: location,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getLocations(req, res, next) {
  try {
    const { textSearch } = req.query;
    const locations = await LocationService.getLocations(textSearch);
    return res.json({
      success: true,
      payload: locations,
    });
  } catch (error) {
    return next(error);
  }
}

export async function userGetLocations(req, res, next) {
  try {
    const { textSearch } = req.query;
    const locations = await LocationService.userGetLocations(textSearch);
    return res.json({
      success: true,
      payload: locations,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteLocation(req, res, next) {
  try {
    const {
      id,
    } = req.params;
    await LocationService.deleteLocation(id);
    return res.json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getLocation(req, res, next) {
  try {
    const {
      id,
    } = req.params;
    const location = await LocationService.getLocation(id);
    return res.json({
      success: true,
      payload: location,
    });
  } catch (error) {
    return next(error);
  }
}

export async function userGetLocation(req, res, next) {
  try {
    const {
      id,
    } = req.params;
    const location = await LocationService.userGetLocation(id);
    return res.json({
      success: true,
      payload: location,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateLocation(req, res, next) {
  try {
    const location = await LocationService.updateLocation(req.params.id, req.body);
    return res.json({
      success: true,
      payload: location,
    });
  } catch (error) {
    return next(error);
  }
}
