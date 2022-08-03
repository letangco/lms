import * as CategoryService from './category.service';

export async function createCategory(req, res, next) {
  try {
    const category = await CategoryService.createCategory(req.body);
    return res.json({
      success: true,
      payload: category,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getCategories(req, res, next) {
  try {
    const categories = await CategoryService.getCategories();
    return res.json({
      success: true,
      payload: categories,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    const {
      id,
    } = req.params;
    await CategoryService.deleteCategory(id);
    return res.json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const category = await CategoryService.updateCategory(req.params.id, req.body);
    return res.json({
      success: true,
      payload: category,
    });
  } catch (error) {
    return next(error);
  }
}
