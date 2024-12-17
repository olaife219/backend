const Joi = require('joi');

// Joi schema for signup validation
const signupSchema = Joi.object({
    name: Joi.string().trim().required().messages({
        'string.empty': 'Name is required',
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Invalid email format',
        'string.empty': 'Email is required',
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.empty': 'Password is required',
    }),
});

// Validation function
const validateSignup = (data) => {
    const { error } = signupSchema.validate(data, { abortEarly: false }); // Validate and collect all errors
    if (error) {
        const errors = error.details.map((detail) => ({
            field: detail.context.key,
            message: detail.message,
        }));
        return { isValid: false, errors };
    }
    return { isValid: true };
};

module.exports = { validateSignup };
