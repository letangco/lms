import * as MessageService from './chatMessage.service';
import { ROOT_PATH } from '../../constants';

export async function addMessage(req, res, next) {
  try {
    const {
      auth,
      params,
      body,
    } = req;
    const files = req.files.map((file) => {
      const rootPath = file.destination.replace(`${ROOT_PATH}/`, '');
      file.url = `${rootPath}/${file.filename}`;
      return file;
    });
    const content = body.content ? body.content : {};
    content.files = files;
    const message = await MessageService.addMessage({
      sender: auth._id,
      group: params.group,
      content: content,
    });
    return res.json({
      success: true,
      payload: message,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getUserGroupMessages(req, res, next) {
  try {
    // Auth can be user or supporter
    const auth = req.auth;
    const {
      firstId,
      lastId,
      rowPerPage,
    } = req.query;
    const {
      group,
    } = req.params;
    const data = await MessageService.getUserGroupMessages(auth._id, group, rowPerPage, firstId, lastId);
    return res.json({
      success: true,
      payload: data,
    });
  } catch (error) {
    return next(error);
  }
}
