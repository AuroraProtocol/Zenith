const mongoose = require('mongoose');
require('dotenv').config();

 async function connectToDatabase ()   {
    try {
        await mongoose.connect(process.env.MONGO_URI, {});
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
    }
}

module.exports = connectToDatabase;