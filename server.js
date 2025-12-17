const xmlparser = require('express-xml-bodyparser');
const xmlbuilder = require('xmlbuilder');
const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const Task = require('./models/Task');
const { validateTaskSchema } = require('./middleware/validateSchema');
const { fetchRandomAdvice } = require('./externalService');

const app = express();
const PORT = process.env.PORT || 3000;
const swaggerDocument = YAML.load('./swagger.yaml');

app.use(express.json());
const sendResponse = (req, res, statusCode, data) => {
    // 1. Check if the client accepts XML
    if (req.accepts('xml')) {
        const xml = xmlbuilder.create({ task: data }).end({ pretty: true });
        res.set('Content-Type', 'application/xml');
        return res.status(statusCode).send(xml);
    }

    // 2. Default to JSON if no preference or if JSON is accepted
    return res.status(statusCode).json(data);
};
// --- Documentation Setup ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); 

// --- Database Connection ---
mongoose.connect('mongodb://localhost:27017/midtermDB')
.then(() => console.log('MongoDB connected.'))
.catch(err => console.error('MongoDB connection error:', err));

// --- API Routes (CRUD Operations) ---

// POST: Create Task (Validation + 3rd Party API)
app.post('/api/tasks', validateTaskSchema, async (req, res) => {
    try {
        const randomAdvice = await fetchRandomAdvice(); 
        const taskData = { ...req.body, externalAdvice: randomAdvice };
        const newTask = new Task(taskData);
        const savedTask = await newTask.save();
        res.status(201).json(savedTask); 
    } catch (error) {
        console.error("Error creating task:", error); 
        res.status(500).json({ message: 'Internal Server Error', detail: error.message });
    }
});

// GET: Read All Tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// PUT: Update a Task
app.put('/api/tasks/:id', async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id, req.body, { new: true, runValidators: true }
        );
        if (!updatedTask) return res.status(404).json({ message: 'Task not found' });
        res.status(200).json(updatedTask);
    } catch (error) {
        if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// DELETE: Delete a Task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);
        if (!deletedTask) return res.status(404).json({ message: 'Task not found' });
        res.status(204).send(); 
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});