const mongoose = require('mongoose');
const uri = 'mongodb+srv://derekartist09_db_user:xQSPVaLJYyhlWPA9@indra.x7rn3l8.mongodb.net/indraprastha?retryWrites=true&w=majority';
mongoose.connect(uri)
  .then(() => {
    console.log('Connected successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection failed:', err.message);
    process.exit(1);
  });
