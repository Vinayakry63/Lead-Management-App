const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Lead = require('../models/Lead');
const router = express.Router();

// Helper function to build filter query
const buildFilterQuery = (filters, userId) => {
  let query = { user: userId };

  if (filters.email) {
    if (filters.email.operator === 'equals') {
      query.email = filters.email.value;
    } else if (filters.email.operator === 'contains') {
      query.email = { $regex: filters.email.value, $options: 'i' };
    }
  }

  if (filters.company) {
    if (filters.company.operator === 'equals') {
      query.company = filters.company.value;
    } else if (filters.company.operator === 'contains') {
      query.company = { $regex: filters.company.value, $options: 'i' };
    }
  }

  if (filters.city) {
    if (filters.city.operator === 'equals') {
      query.city = filters.city.value;
    } else if (filters.city.operator === 'contains') {
      query.city = { $regex: filters.city.value, $options: 'i' };
    }
  }

  if (filters.status) {
    if (filters.status.operator === 'equals') {
      query.status = filters.status.value;
    } else if (filters.status.operator === 'in') {
      query.status = { $in: filters.status.value };
    }
  }

  if (filters.source) {
    if (filters.source.operator === 'equals') {
      query.source = filters.source.value;
    } else if (filters.source.operator === 'in') {
      query.source = { $in: filters.source.value };
    }
  }

  if (filters.score) {
    if (filters.score.operator === 'equals') {
      query.score = filters.score.value;
    } else if (filters.score.operator === 'gt') {
      query.score = { $gt: filters.score.value };
    } else if (filters.score.operator === 'lt') {
      query.score = { $lt: filters.score.value };
    } else if (filters.score.operator === 'between') {
      query.score = { $gte: filters.score.value[0], $lte: filters.score.value[1] };
    }
  }

  if (filters.lead_value) {
    if (filters.lead_value.operator === 'equals') {
      query.lead_value = filters.lead_value.value;
    } else if (filters.lead_value.operator === 'gt') {
      query.lead_value = { $gt: filters.lead_value.value };
    } else if (filters.lead_value.operator === 'lt') {
      query.lead_value = { $lt: filters.lead_value.value };
    } else if (filters.lead_value.operator === 'between') {
      query.lead_value = { $gte: filters.lead_value.value[0], $lte: filters.lead_value.value[1] };
    }
  }

  if (filters.created_at) {
    if (filters.created_at.operator === 'on') {
      const date = new Date(filters.created_at.value);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      query.createdAt = { $gte: date, $lt: nextDay };
    } else if (filters.created_at.operator === 'before') {
      query.createdAt = { $lt: new Date(filters.created_at.value) };
    } else if (filters.created_at.operator === 'after') {
      query.createdAt = { $gt: new Date(filters.created_at.value) };
    } else if (filters.created_at.operator === 'between') {
      query.createdAt = { 
        $gte: new Date(filters.created_at.value[0]), 
        $lte: new Date(filters.created_at.value[1]) 
      };
    }
  }

  if (filters.last_activity_at) {
    if (filters.last_activity_at.operator === 'on') {
      const date = new Date(filters.last_activity_at.value);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      query.last_activity_at = { $gte: date, $lt: nextDay };
    } else if (filters.last_activity_at.operator === 'before') {
      query.last_activity_at = { $lt: new Date(filters.last_activity_at.value) };
    } else if (filters.last_activity_at.operator === 'after') {
      query.last_activity_at = { $gt: new Date(filters.last_activity_at.value) };
    } else if (filters.last_activity_at.operator === 'between') {
      query.last_activity_at = { 
        $gte: new Date(filters.last_activity_at.value[0]), 
        $lte: new Date(filters.last_activity_at.value[1]) 
      };
    }
  }

  if (filters.is_qualified !== undefined) {
    query.is_qualified = filters.is_qualified.value;
  }

  return query;
};

// Create lead
router.post('/', [
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('company').trim().notEmpty().withMessage('Company is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('source').isIn(['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other']).withMessage('Invalid source'),
  body('status').isIn(['new', 'contacted', 'qualified', 'lost', 'won']).withMessage('Invalid status'),
  body('score').isInt({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  body('lead_value').isFloat({ min: 0 }).withMessage('Lead value must be a positive number'),
  body('is_qualified').optional().isBoolean().withMessage('is_qualified must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // Check if email already exists for this user
    const existingLead = await Lead.findOne({ 
      email: req.body.email, 
      user: req.user._id 
    });
    
    if (existingLead) {
      return res.status(409).json({ 
        error: 'Lead with this email already exists',
        code: 'EMAIL_EXISTS'
      });
    }

    const leadData = {
      ...req.body,
      user: req.user._id,
      last_activity_at: req.body.last_activity_at || new Date()
    };

    const lead = new Lead(leadData);
    await lead.save();

    res.status(201).json({
      message: 'Lead created successfully',
      lead
    });
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ 
      error: 'Internal server error while creating lead',
      code: 'CREATE_ERROR'
    });
  }
});

// Get leads with pagination and filters
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filters = req.query.filters ? JSON.parse(req.query.filters) : {};

    const query = buildFilterQuery(filters, req.user._id);
    const total = await Lead.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Debug: print received query params and number of leads returned
    console.log('Backend pagination debug:', {
      receivedQuery: req.query,
      page,
      limit,
      total,
      totalPages,
      query
    });

    const leads = await Lead.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    console.log('Backend leads returned:', { count: leads.length });

    res.status(200).json({
      data: leads,
      page,
      limit,
      total,
      totalPages
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching leads',
      code: 'FETCH_ERROR'
    });
  }
});

// Get single lead
router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!lead) {
      return res.status(404).json({ 
        error: 'Lead not found',
        code: 'LEAD_NOT_FOUND'
      });
    }

    res.status(200).json({ lead });
  } catch (error) {
    console.error('Get lead error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ 
        error: 'Invalid lead ID',
        code: 'INVALID_ID'
      });
    }
    res.status(500).json({ 
      error: 'Internal server error while fetching lead',
      code: 'FETCH_ERROR'
    });
  }
});

// Update lead
router.put('/:id', [
  body('first_name').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('last_name').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().notEmpty().withMessage('Phone cannot be empty'),
  body('company').optional().trim().notEmpty().withMessage('Company cannot be empty'),
  body('city').optional().trim().notEmpty().withMessage('City cannot be empty'),
  body('state').optional().trim().notEmpty().withMessage('State cannot be empty'),
  body('source').optional().isIn(['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other']).withMessage('Invalid source'),
  body('status').optional().isIn(['new', 'contacted', 'qualified', 'lost', 'won']).withMessage('Invalid status'),
  body('score').optional().isInt({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  body('lead_value').optional().isFloat({ min: 0 }).withMessage('Lead value must be a positive number'),
  body('is_qualified').optional().isBoolean().withMessage('is_qualified must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // Check if lead exists and belongs to user
    const existingLead = await Lead.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!existingLead) {
      return res.status(404).json({ 
        error: 'Lead not found',
        code: 'LEAD_NOT_FOUND'
      });
    }

    // Check if email is being changed and if it conflicts with another lead
    if (req.body.email && req.body.email !== existingLead.email) {
      const emailConflict = await Lead.findOne({ 
        email: req.body.email, 
        user: req.user._id,
        _id: { $ne: req.params.id }
      });
      
      if (emailConflict) {
        return res.status(409).json({ 
          error: 'Lead with this email already exists',
          code: 'EMAIL_EXISTS'
        });
      }
    }

    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body,
        last_activity_at: req.body.last_activity_at || new Date()
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Lead updated successfully',
      lead: updatedLead
    });
  } catch (error) {
    console.error('Update lead error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ 
        error: 'Invalid lead ID',
        code: 'INVALID_ID'
      });
    }
    res.status(500).json({ 
      error: 'Internal server error while updating lead',
      code: 'UPDATE_ERROR'
    });
  }
});

// Delete lead
router.delete('/:id', async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!lead) {
      return res.status(404).json({ 
        error: 'Lead not found',
        code: 'LEAD_NOT_FOUND'
      });
    }

    res.status(200).json({
      message: 'Lead deleted successfully',
      lead
    });
  } catch (error) {
    console.error('Delete lead error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ 
        error: 'Invalid lead ID',
        code: 'INVALID_ID'
      });
    }
    res.status(500).json({ 
      error: 'Internal server error while deleting lead',
      code: 'DELETE_ERROR'
    });
  }
});

module.exports = router;
