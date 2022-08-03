import * as TeachingLanguageService from './teachingLanguage.service';

export async function getTeachingLanguages(req, res, next) {
  try {
    const teachingLanguages = await TeachingLanguageService.getTeachingLanguages();
    return res.json({
      success: true,
      payload: teachingLanguages,
    });
  } catch (error) {
    return next(error);
  }
}
