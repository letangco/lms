import * as LanguageService from './language.service';

export async function getLanguages(req, res, next) {
  try {
    const languages = await LanguageService.getLanguages();
    return res.json({
      success: true,
      payload: languages,
    });
  } catch (error) {
    return next(error);
  }
}
