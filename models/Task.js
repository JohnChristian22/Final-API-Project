const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    isComplete: { type: Boolean, default: false },
    externalAdvice: { type: String } 
});

module.exports = mongoose.model('Task', taskSchema);