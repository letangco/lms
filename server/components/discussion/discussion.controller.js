import * as DiscussionService from './discussion.service';

export async function createDiscussion(req, res, next) {
  try {
    const discussion = await DiscussionService.createDiscussion(req.auth, req.body);
    return res.json({
      success: true,
      payload: discussion,
    });
  } catch (error) {
    return next(error);
  }
}

export async function createDiscussionComment(req, res, next) {
  try {
    const discussion = await DiscussionService.createDiscussionComment(req.auth, req.body);
    return res.json({
      success: true,
      payload: discussion,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getDiscussions(req, res, next) {
  try {
    const discussions = await DiscussionService.getDiscussions(req.query);
    return res.json({
      success: true,
      payload: discussions,
    });
  } catch (error) {
    return next(error);
  }
}
export async function getDiscussionComments(req, res, next) {
  try {
    const discussions = await DiscussionService.getDiscussionComments(req.query);
    return res.json({
      success: true,
      payload: discussions,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getDiscussion(req, res, next) {
  try {
    const discussion = await DiscussionService.getDiscussion(req.params.id);
    return res.json({
      success: true,
      payload: discussion,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getDiscussionComment(req, res, next) {
  try {
    const discussion = await DiscussionService.getDiscussionComment(req.params.id);
    return res.json({
      success: true,
      payload: discussion,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteDiscussion(req, res, next) {
  try {
    const {
      id,
    } = req.params;
    await DiscussionService.deleteDiscussion(id, req.auth);
    return res.json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
}
export async function deleteDiscussionComment(req, res, next) {
  try {
    const {
      id,
    } = req.params;
    await DiscussionService.deleteDiscussionComment(id);
    return res.json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateDiscussion(req, res, next) {
  try {
    const discussion = await DiscussionService.updateDiscussion(req.params.id, req.body, req.auth);
    return res.json({
      success: true,
      payload: discussion,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateDiscussionComment(req, res, next) {
  try {
    const discussion = await DiscussionService.updateDiscussionComment(req.params.id, req.body);
    return res.json({
      success: true,
      payload: discussion,
    });
  } catch (error) {
    return next(error);
  }
}
