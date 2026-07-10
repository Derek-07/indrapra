const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('cookie-session');

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
const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    clientName: { type: String, required: true },
    status: { type: String, default: 'Planning' }, // Planning, Construction, Finishing, Completed
    progress: { type: Number, default: 0 },
    managerName: { type: String, default: 'Admin' },
    category: { type: String, default: 'residential' },
    imageUrl: { type: String, default: '' },
    description: { type: String, default: '' },
    location: { type: String, default: '' },
    year: { type: String, default: '' },
    area: { type: String, default: '' },
    duration: { type: String, default: '' },
    virtualTourUrl: { type: String, default: '' },
    keyFeatures: { type: [String], default: [] },
    materialsUsed: { type: [String], default: [] },
    gallery: { type: [String], default: [] },
    clientQuote: { type: String, default: '' },
    bannerImageUrl: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});
const Project = mongoose.model('Project', projectSchema);

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});
const Blog = mongoose.model('Blog', blogSchema);

const testimonialSchema = new mongoose.Schema({
    authorName: { type: String, required: true },
    role: { type: String, default: 'Client' },
    quote: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const Testimonial = mongoose.model('Testimonial', testimonialSchema);

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status: { type: String, default: 'Approved' },
    role: { type: String, default: 'user' },
    assignedProject: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
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

let dbError = null;
let isConnected = false;
async function connectDB() {
    if (isConnected) return;
    try {
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
        isConnected = true;
        dbError = null;
        console.log('Connected to MongoDB Atlas (Serverless)');
        
        // Seed initial content
        const contentCount = await Content.countDocuments();
        if (contentCount === 0) {
            await Content.insertMany([
                { key: 'hero_title', value: 'Indraprastha' },
                { key: 'hero_subtitle', value: 'Building modern spaces with precision, quality, and lasting value.' },
                { key: 'about_title', value: 'Building Your Vision With Excellence' }
            ]);
        }

        // Seed admin user
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
            await User.create({
                email: 'Admin@gmail.com',
                password: 'Admin@12345',
                status: 'Approved',
                role: 'admin'
            });
        }
        
        loadContentCache();
    } catch (err) {
        dbError = err.message;
        console.error('MongoDB connection error:', err);
    }
}

app.use(async (req, res, next) => {
    await connectDB();
    if (dbError && req.path === '/api/login') {
        return res.render('login', { error: 'DB Connection Error: ' + dbError });
    }
    next();
});


// Middleware to inject site content into templates instantly
app.use((req, res, next) => {
    res.locals.content = contentCache || {};
    res.locals.user = req.session.user || null;
    next();
});

// --- ROUTES ---

// Public Pages
// Public Routes
app.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find({}).sort({ createdAt: -1 }).limit(3);
        const testimonials = await Testimonial.find({}).sort({ createdAt: -1 });
        const projects = await Project.find({}).sort({ createdAt: -1 }).limit(3);
        res.render('index', { content: contentCache || {}, blogs, testimonials, projects });
    } catch(err) { res.status(500).send('Error loading page'); }
});
app.get('/index.html', (req, res) => res.redirect('/'));

app.get('/about.html', (req, res) => res.render('about', { content: contentCache || {} }));
app.get('/projects.html', async (req, res) => {
    try {
        const projects = await Project.find({}).sort({ createdAt: -1 });
        res.render('projects', { content: contentCache || {}, projects });
    } catch(err) { res.status(500).send('Error loading page'); }
});
app.get('/project-detail/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).send('Project not found');
        res.render('project-detail', { content: contentCache || {}, project });
    } catch(err) {
        res.status(500).send('Error loading project');
    }
});
app.get('/design-ideas.html', (req, res) => res.render('design-ideas', { content: contentCache || {} }));
app.get('/logo-upgrade.html', (req, res) => res.render('logo-upgrade', { content: contentCache || {} }));
app.get('/reach-us.html', (req, res) => res.render('reach-us', { content: contentCache || {} }));
app.get('/blog.html', async (req, res) => {
    try {
        const blogs = await Blog.find({}).sort({ createdAt: -1 });
        res.render('blog', { content: contentCache || {}, blogs });
    } catch(err) { res.status(500).send('Error loading page'); }
});
app.get('/login.html', (req, res) => res.render('login', { error: null }));
app.get('/signup.html', (req, res) => res.render('signup', { error: null, success: null }));

// Dashboard (Protected)
app.get('/dashboard.html', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'user') {
        return res.redirect('/login.html');
    }
    try {
        const userWithProject = await User.findById(req.session.user._id).populate('assignedProject');
        res.render('dashboard', { user: userWithProject });
    } catch (err) {
        res.status(500).send('Error loading dashboard');
    }
});

// Auth API endpoints
app.post('/api/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        await User.create({ email, password });
        res.render('signup', { error: null, success: 'Account created! Please login now.' });
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
        const users = await User.find({ role: 'user' }).populate('assignedProject').sort({ createdAt: -1 });
        const contents = await Content.find({});
        const projects = await Project.find({}).sort({ createdAt: -1 });
        const blogs = await Blog.find({}).sort({ createdAt: -1 });
        const testimonials = await Testimonial.find({}).sort({ createdAt: -1 });
        res.render('admin', { users: users || [], contents: contents || [], projects: projects || [], blogs: blogs || [], testimonials: testimonials || [] });
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

// Project Routes
app.post('/admin/projects/new', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.status(403).send('Unauthorized');
    try {
        await Project.create({
            title: req.body.title,
            authorName: req.body.authorName,
            status: req.body.status,
            progress: req.body.progress || 0,
            managerName: req.body.managerName || 'Admin'
        });
        res.redirect('/admin');
    } catch (err) {
        res.status(500).send('Error creating project');
    }
});

app.post('/admin/users/assign', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.status(403).send('Unauthorized');
    try {
        const { userId, projectId } = req.body;
        await User.findByIdAndUpdate(userId, { 
            assignedProject: projectId || null 
        });
        res.redirect('/admin');
    } catch (err) {
        res.status(500).send('Error assigning project');
    }
});

// Blog Routes
app.post('/admin/blogs/new', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.status(403).send('Unauthorized');
    try {
        await Blog.create({
            title: req.body.title,
            content: req.body.content,
            imageUrl: req.body.imageUrl || ''
        });
        res.redirect('/admin');
    } catch (err) {
        res.status(500).send('Error creating blog');
    }
});

app.post('/admin/blogs/delete/:id', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.status(403).send('Unauthorized');
    try {
        await Blog.findByIdAndDelete(req.params.id);
        res.redirect('/admin');
    } catch (err) {
        res.status(500).send('Error deleting blog');
    }
});

// Testimonial Routes
app.post('/admin/testimonials/new', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.status(403).send('Unauthorized');
    try {
        await Testimonial.create({
            authorName: req.body.authorName,
            role: req.body.role || 'Client',
            quote: req.body.quote
        });
        res.redirect('/admin');
    } catch (err) {
        res.status(500).send('Error creating testimonial');
    }
});

app.post('/admin/testimonials/delete/:id', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.status(403).send('Unauthorized');
    try {
        await Testimonial.findByIdAndDelete(req.params.id);
        res.redirect('/admin');
    } catch (err) {
        res.status(500).send('Error deleting testimonial');
    }
});

// Project Edit
app.post('/admin/projects/edit/:id', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.status(403).send('Unauthorized');
    try {
        await Project.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            authorName: req.body.authorName,
            status: req.body.status,
            progress: req.body.progress,
            managerName: req.body.managerName,
            category: req.body.category.toLowerCase(),
            imageUrl: req.body.imageUrl
        });
        res.redirect('/admin');
    } catch (err) {
        res.status(500).send('Error updating project');
    }
});
// Project Delete
app.post('/admin/projects/delete/:id', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.status(403).send('Unauthorized');
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.redirect('/admin');
    } catch (err) {
        res.status(500).send('Error deleting project');
    }
});

// Blog Edit
app.post('/admin/blogs/edit/:id', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.status(403).send('Unauthorized');
    try {
        await Blog.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            category: req.body.category,
            content: req.body.content,
            imageUrl: req.body.imageUrl
        });
        res.redirect('/admin');
    } catch (err) {
        res.status(500).send('Error updating blog');
    }
});

// Testimonial Edit
app.post('/admin/testimonials/edit/:id', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.status(403).send('Unauthorized');
    try {
        await Testimonial.findByIdAndUpdate(req.params.id, {
            authorName: req.body.authorName,
            role: req.body.role,
            quote: req.body.quote
        });
        res.redirect('/admin');
    } catch (err) {
        res.status(500).send('Error updating testimonial');
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






















