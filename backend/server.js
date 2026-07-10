const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://derekartist09_db_user:xQSPVaLJYyhlWPA9@indra.x7rn3l8.mongodb.net/indraprastha?retryWrites=true&w=majority";

// Setup Paths
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
app.set('views', path.join(FRONTEND_DIR, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(express.static(path.join(FRONTEND_DIR, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'indraprastha_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Mongoose Models
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status: { type: String, default: 'Pending' },
    role: { type: String, default: 'user' },
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const contentSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true }
});
const Content = mongoose.model('Content', contentSchema);

// Cache for lightning fast performance
let contentCache = null;

async function loadContentCache(callback) {
    try {
        const contents = await Content.find({});
        const siteContent = {};
        contents.forEach(item => {
            siteContent[item.key] = item.value;
        });
        contentCache = siteContent;
        if (callback) callback();
    } catch (err) {
        console.error('Error loading content cache:', err);
    }
}

// Database Connection
mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('âœ… Connected to MongoDB Atlas');
        
        // Seed initial content if DB is empty
        const contentCount = await Content.countDocuments();
        if (contentCount === 0) {
            await Content.insertMany([
                { key: 'hero_title', value: 'Indraprastha' },
                { key: 'hero_subtitle', value: 'Building modern spaces with precision, quality, and lasting value.' },
                { key: 'about_title', value: 'Building Your Vision With Excellence' }
            ]);
            console.log('Seeded default CMS content');
        }

        // Seed admin user if not exists
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
            await User.create({
                email: 'Admin@gmail.com',
                password: 'Admin@12345',
                status: 'Approved',
                role: 'admin'
            });
            console.log('Seeded default Admin user');
        }

        // Load Cache
        loadContentCache();
    })
    .catch(err => console.error('MongoDB connection error:', err));


// Middleware to inject site content into templates instantly
app.use((req, res, next) => {
    res.locals.content = contentCache || {};
    res.locals.user = req.session.user || null;
    next();
});

// --- ROUTES ---

// Public Pages
app.get('/', (req, res) => res.render('index'));
app.get('/about.html', (req, res) => res.render('about'));
app.get('/projects.html', (req, res) => res.render('projects'));
app.get('/project-detail.html', (req, res) => res.render('project-detail'));
app.get('/design-ideas.html', (req, res) => res.render('design-ideas'));
app.get('/logo-upgrade.html', (req, res) => res.render('logo-upgrade'));
app.get('/reach-us.html', (req, res) => res.render('reach-us'));
app.get('/blog.html', (req, res) => res.render('blog'));
app.get('/login.html', (req, res) => res.render('login', { error: null }));
app.get('/signup.html', (req, res) => res.render('signup', { error: null, success: null }));

// Dashboard (Protected)
app.get('/dashboard.html', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'user') {
        return res.redirect('/login.html');
    }
    if (req.session.user.status !== 'Approved') {
        return res.render('login', { error: 'Your account is pending admin approval.' });
    }
    res.render('dashboard');
});

// Auth API endpoints
app.post('/api/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        await User.create({ email, password });
        res.render('signup', { error: null, success: 'Account created! Waiting for Admin approval.' });
    } catch (err) {
        res.render('signup', { error: 'Email already exists or invalid.', success: null });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });
        
        if (!user) {
            return res.render('login', { error: 'Invalid email or password.' });
        }
        
        req.session.user = user;
        
        if (user.role === 'admin') {
            return res.redirect('/admin');
        }
        
        if (user.status !== 'Approved') {
            req.session.destroy();
            return res.render('login', { error: 'Your account is pending admin approval. Please wait.' });
        }
        
        res.redirect('/dashboard.html');
    } catch (err) {
        res.render('login', { error: 'Error: ' + err.message });
    }
});

app.get('/api/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Admin CMS Routes
app.get('/admin', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login.html');
    }
    
    try {
        const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
        const contents = await Content.find({});
        res.render('admin', { users: users || [], contents: contents || [] });
    } catch (err) {
        res.status(500).send('Error loading admin dashboard');
    }
});

app.post('/admin/approve/:id', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.status(403).send('Unauthorized');
    await User.findByIdAndUpdate(req.params.id, { status: 'Approved' });
    res.redirect('/admin');
});

app.post('/admin/reject/:id', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.status(403).send('Unauthorized');
    await User.findByIdAndUpdate(req.params.id, { status: 'Rejected' });
    res.redirect('/admin');
});

app.post('/admin/content/update', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.status(403).send('Unauthorized');
    
    const updates = Object.keys(req.body);
    
    try {
        for (const key of updates) {
            const value = req.body[key];
            await Content.findOneAndUpdate({ key }, { value }, { upsert: true });
        }
        
        // Refresh cache so live site gets the update instantly
        await loadContentCache();
        res.redirect('/admin');
    } catch (err) {
        res.status(500).send('Error saving content');
    }
});

// Export the app for Vercel
module.exports = app;

// Only start the server if we're not running in Vercel (serverless environment)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}


