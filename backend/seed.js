const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    clientName: { type: String, required: true },
    status: { type: String, default: 'Planning' },
    progress: { type: Number, default: 0 },
    managerName: { type: String, default: 'Admin' },
    imageUrl: { type: String, default: '' },
    description: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});
const Project = mongoose.model('Project', projectSchema);

async function seed() {
    try {
        await mongoose.connect('mongodb+srv://derekartist09_db_user:xQSPVaLJYyhlWPA9@indra.x7rn3l8.mongodb.net/indraprastha?retryWrites=true&w=majority');
        
        await Project.create([
            { title: 'The Skyline Elite', clientName: 'Mr. Rakesh Sharma', status: 'Completed', progress: 100, managerName: 'Amit Jain', imageUrl: 'asset/image/commercial/card_commercial.jpg' },
            { title: 'Oasis Green Villas', clientName: 'Sharma Group', status: 'Construction', progress: 60, managerName: 'Rahul Verma', imageUrl: 'asset/image/hero/interior_idea.jpg' },
            { title: 'Apex Commercial Tower', clientName: 'Apex Industries', status: 'Planning', progress: 15, managerName: 'Sanjay Gupta', imageUrl: 'asset/image/commercial/idea_bedroom.jpg' }
        ]);
        
        console.log('Seeded projects successfully');
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
seed();
