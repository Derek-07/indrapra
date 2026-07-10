require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: String,
    imageUrl: String
});

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://user:user@cluster0.zoxok.mongodb.net/indraprastha?retryWrites=true&w=majority&appName=Cluster0')
.then(async () => {
    const projects = await Project.find();
    console.log(projects);
    process.exit(0);
})
.catch(err => {
    console.error(err);
    process.exit(1);
});
