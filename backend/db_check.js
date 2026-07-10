const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://dgo733513:30aWkU2O2Nn0vSgE@indra.27581.mongodb.net/?retryWrites=true&w=majority&appName=indra');
const Project = mongoose.model('Project', new mongoose.Schema({ title: String, imageUrl: String }, { strict: false }));
async function run() {
    const projs = await Project.find({}, 'title imageUrl');
    console.log(projs);
    process.exit();
}
run();
