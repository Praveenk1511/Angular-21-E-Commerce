import { Review } from '../models/review.model.js';

export async function getReviewsByProduct(req, res) {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
}

export async function createReview(req, res) {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;

    const newReview = new Review({
      id: `rev-${Date.now()}`,
      productId,
      userId: req.user.id,
      authorName: `${req.user.firstName} ${req.user.lastName}`,
      rating,
      title,
      comment,
      verifiedPurchase: true,
    });

    const saved = await newReview.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create review', error: error.message });
  }
}
