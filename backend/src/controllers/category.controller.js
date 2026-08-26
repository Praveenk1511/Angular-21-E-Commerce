import { Category } from '../models/category.model.js';

export async function getCategories(req, res) {
  try {
    const categories = await Category.find().sort({ displayOrder: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
}

export async function getCategoryByIdOrSlug(req, res) {
  try {
    const { idOrSlug } = req.params;
    const category = await Category.findOne({
      $or: [{ id: idOrSlug }, { slug: idOrSlug }],
    });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category', error: error.message });
  }
}

export async function createCategory(req, res) {
  try {
    const category = new Category(req.body);
    const saved = await category.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create category', error: error.message });
  }
}

export async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const updated = await Category.findOneAndUpdate({ id }, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Category not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update category', error: error.message });
  }
}

export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Category.findOneAndDelete({ id });
    if (!deleted) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete category', error: error.message });
  }
}
