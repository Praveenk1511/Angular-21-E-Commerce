import { Inventory } from '../models/inventory.model.js';

export async function getInventory(req, res) {
  try {
    const items = await Inventory.find().sort({ sku: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory', error: error.message });
  }
}

export async function updateInventoryStock(req, res) {
  try {
    const { id } = req.params;
    const { onHand, reorderLevel } = req.body;
    const update = {};
    if (typeof onHand === 'number') update.onHand = onHand;
    if (typeof reorderLevel === 'number') update.reorderLevel = reorderLevel;

    const updated = await Inventory.findOneAndUpdate({ id }, update, { new: true });
    if (!updated) return res.status(404).json({ message: 'Inventory item not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Error updating inventory', error: error.message });
  }
}
