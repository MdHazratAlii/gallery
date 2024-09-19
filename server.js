const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Define Wallpaper schema and model
const wallpaperSchema = new mongoose.Schema({
    title: String,
    description: String,
    category: String,
    imageUrl: String
});

const Wallpaper = mongoose.model('Wallpaper', wallpaperSchema);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer setup for file uploads
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/');
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + path.extname(file.originalname));
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Route to upload a wallpaper
app.post('/upload', upload.single('image'), async (req, res) => {
    const { title, description, category } = req.body;
    const imagePath = req.file.path;

    try {
        const formData = new FormData();
        formData.append('image', fs.createReadStream(imagePath));

        const imgBBResponse = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData
        });

        const imgBBResult = await imgBBResponse.json();

        if (imgBBResult.status === 200) {
            const imageUrl = imgBBResult.data.url;
            const newWallpaper = new Wallpaper({ title, description, category, imageUrl });
            await newWallpaper.save();

            res.status(201).json(newWallpaper);
        } else {
            res.status(500).json({ error: 'Image upload to IMGBB failed' });
        }
    } catch (error) {
        console.error('Error uploading wallpaper:', error);
        res.status(500).json({ error: 'Error uploading wallpaper' });
    } finally {
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
    }
});

// Route to fetch wallpapers with search or filter by category
app.get('/wallpapers', async (req, res) => {
    const { search, category } = req.query;

    try {
        const query = {};
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }
        if (category) {
            query.category = category;
        }

        const wallpapers = await Wallpaper.find(query);
        res.json(wallpapers);
    } catch (error) {
        console.error('Error fetching wallpapers:', error);
        res.status(500).json({ error: 'Error fetching wallpapers' });
    }
});

// Route to fetch wallpaper by ID
app.get('/preview/:id', async (req, res) => {
    const id = req.params.id;

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        const wallpaper = await Wallpaper.findById(id);

        if (wallpaper) {
            res.json(wallpaper);
        } else {
            res.status(404).json({ error: 'Wallpaper not found' });
        }
    } catch (error) {
        console.error('Error fetching wallpaper:', error);
        res.status(500).json({ error: 'Error fetching wallpaper' });
    }
});

// Handle 404 for unmatched routes
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Working Code 