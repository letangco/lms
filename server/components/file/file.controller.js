import * as FileService from './file.service';

export async function createFile(req, res, next) {
  try {
    const {
      body,
      auth,
      file
    } = req;
    const data = await FileService.createFile(auth, body, file);
    return res.json({
      success: true,
      payload: data
    });
  } catch (error) {
    return next(error);
  }
}
export async function userCreateFile(req, res, next) {
  try {
    const {
      body,
      auth,
      file,
      query
    } = req;
    let data = await FileService.userCreateFile(auth, body, file);
    data = data.toJSON();
    if (query.type === 'editor') {
      return res.json(
        { location: data.path }
      );
    }
    return res.json({
      success: true,
      payload: data
    });
  } catch (error) {
    return next(error);
  }
}
export async function updateFile(req, res, next) {
  try {
    const {
      body,
      auth,
      query
    } = req;
    const file = await FileService.updateFile(query.id, auth, body);
    return res.json({
      success: true,
      payload: file
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteFile(req, res, next) {
  try {
    const {
      auth,
      query
    } = req;
    const file = await FileService.deleteFile(query.id, auth);
    return res.json({
      success: true,
      payload: file
    });
  } catch (error) {
    return next(error);
  }
}

export async function getFile(req, res, next) {
  try {
    const {
      auth,
      query
    } = req;
    const file = await FileService.getFile(query.id, auth);
    return res.json({
      success: true,
      payload: file
    });
  } catch (error) {
    return next(error);
  }
}

export async function userGetFile(req, res, next) {
  try {
    const {
      query
    } = req;
    const file = await FileService.userGetFile(query.id);
    return res.json({
      success: true,
      payload: file
    });
  } catch (error) {
    return next(error);
  }
}

export async function getFiles(req, res, next) {
  try {
    const {
      auth,
      query
    } = req;
    const data = await FileService.getFiles(query, auth);
    return res.json({
      success: true,
      payload: data
    });
  } catch (error) {
    return next(error);
  }
}

export async function getShareFiles(req, res, next) {
  try {
    const {
      auth,
      role
    } = req;
    const page = Number(req?.query?.page) || 1;
    const limit = Number(req.query?.limit) || 12;
    const skip = (page - 1) * limit;
    const query = {
      ...req.query,
      limit,
      skip,
      page
    };
    if (query?.course) {
      return res.json({
        success: true,
        payload: await FileService.getShareFilesByCourse(auth, query, role)
      });
    }
    return res.json({
      success: true,
      payload: await FileService.getShareFiles(auth, query, role)
    });
  } catch (error) {
    return next(error);
  }
}


export async function getById(req, res, next) {
  try {
    const {
      params,
      auth,
      role
    } = req;
    params.auth = auth;
    const data = await FileService.getDetailFile(params, role);
    return res.json({
      success: true,
      payload: data
    });
  } catch (error) {
    return next(error);
  }
}


export async function editDetailFile(req, res, next) {
  try {
    const {
      params,
      body,
      auth,
    } = req;
    const data = await FileService.editDetailFile(auth, params, body);
    return res.json({
      success: true,
      payload: data,
    })
  } catch (error) {
    return next(error);
  }
}
