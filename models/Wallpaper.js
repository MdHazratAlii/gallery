const mongoose = require('mongoose');

// Check if the model has already been compiled to avoid the OverwriteModelError
const WallpaperSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    category: { type: String, required: true }, // New category field
}, { timestamps: true });

module.exports = mongoose.models.Wallpaper || mongoose.model('Wallpaper', WallpaperSchema);
