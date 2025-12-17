app.use(xmlparser({ explicitArray: false, normalizeTag: true })); 
app.use(express.json());
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });
const taskSchema = require('../schemas/taskSchema.json'); 
const validate = ajv.compile(taskSchema);

const validateTaskSchema = (req, res, next) => {
    const valid = validate(req.body);
    if (!valid) {
        return res.status(400).json({
            status: 'Validation Error',
            message: 'Request body failed validation.',
            details: validate.errors
        });
    }
    next();
};

module.exports = { validateTaskSchema };