import * as CourseRulesAndPathService from './courseRulesAndPath.service';

export async function createRulesAndPath(req, res, next) {
  try {
    const rulesAndPath = await CourseRulesAndPathService.createRulesAndPath(req.auth, req.body);
    return res.json({
      success: true,
      payload: rulesAndPath,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateRulesAndPath(req, res, next) {
  try {
    const rulesAndPath = await CourseRulesAndPathService.updateRulesAndPath(req.params.id, req.body);
    return res.json({
      success: true,
      payload: rulesAndPath,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getRulesAndPath(req, res, next) {
  try {
    const rulesAndPath = await CourseRulesAndPathService.getRulesAndPath(req.params.id);
    return res.json({
      success: true,
      payload: rulesAndPath,
    });
  } catch (error) {
    return next(error);
  }
}
