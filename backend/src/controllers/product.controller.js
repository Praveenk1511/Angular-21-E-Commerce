import { Product } from '../models/product.model.js';

export async function getProducts(req, res) {
  try {
    const { page = 1, pageSize = 12, q, categoryId, brandIds, minPriceMinor, maxPriceMinor, minRating, sort, direction } = req.query;

    const query = {};

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { summary: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    if (categoryId) {
      query.categoryId = categoryId;
    }

    if (brandIds) {
      const bList = Array.isArray(brandIds) ? brandIds : brandIds.split(',');
      query.brandId = { $in: bList };
    }

    if (minPriceMinor || maxPriceMinor) {
      query['price.amountMinor'] = {};
      if (minPriceMinor) query['price.amountMinor'].$gte = Number(minPriceMinor);
      if (maxPriceMinor) query['price.amountMinor'].$lte = Number(maxPriceMinor);
    }

    if (minRating) {
      query['rating.average'] = { $gte: Number(minRating) };
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(pageSize));
    const skip = (pageNum - 1) * limitNum;

    let sortObj = { createdAt: -1 };
    if (sort === 'price') {
      sortObj = { 'price.amountMinor': direction === 'desc' ? -1 : 1 };
    } else if (sort === 'rating') {
      sortObj = { 'rating.average': -1 };
    } else if (sort === 'name') {
      sortObj = { name: 1 };
    }

    const totalItems = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limitNum) || 1;
    const items = await Product.find(query).sort(sortObj).skip(skip).limit(limitNum);

    const facets = {
      brands: [],
      categories: [],
      priceRange: { minMinor: 0, maxMinor: 100000 },
    };

    res.json({
      items,
      meta: {
        page: pageNum,
        pageSize: limitNum,
        totalPages,
        totalItems,
      },
      facets,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
}

export async function getProductByIdOrSlug(req, res) {
  try {
    const { idOrSlug } = req.params;
    const product = await Product.findOne({
      $or: [{ id: idOrSlug }, { slug: idOrSlug }],
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product details', error: error.message });
  }
}

export async function createProduct(req, res) {
  try {
    const newProduct = new Product(req.body);
    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create product', error: error.message });
  }
}

export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const updated = await Product.findOneAndUpdate({ id }, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update product', error: error.message });
  }
}

export async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Product.findOneAndDelete({ id });
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
}
