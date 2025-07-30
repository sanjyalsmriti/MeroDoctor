/**
 * Controller for contact form operations.
 * Handles contact form submissions and admin management of contact messages.
 *
 * @module controllers/contactController
 */
import Contact from "../models/contactModel.js";

/**
 * Submit a new contact form message.
 * @function
 * @async
 * @param {import('express').Request} req - Express request object (expects name, email, subject, message in body)
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    // Create new contact message
    const newContact = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      status: 'NEW'
    });

    res.status(201).json({
      success: true,
      message: "Thank you for your message! We'll get back to you soon.",
      contact: {
        id: newContact._id,
        name: newContact.name,
        email: newContact.email,
        subject: newContact.subject,
        createdAt: newContact.createdAt
      }
    });

  } catch (error) {
    console.error("Error submitting contact form:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit contact form. Please try again."
    });
  }
};

/**
 * Get all contact messages for admin panel.
 * @function
 * @async
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
const getAllContacts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    // Build filter object
    const filter = {};
    if (status && status !== 'ALL') {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get contacts with pagination
    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Contact.countDocuments(filter);

    // Get status counts
    const statusCounts = await Contact.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusStats = {
      NEW: 0,
      READ: 0,
      REPLIED: 0,
      TOTAL: total
    };

    statusCounts.forEach(stat => {
      statusStats[stat._id] = stat.count;
    });

    res.status(200).json({
      success: true,
      contacts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      },
      statusStats
    });

  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contact messages"
    });
  }
};

/**
 * Get a single contact message by ID.
 * @function
 * @async
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
const getContactById = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found"
      });
    }

    // Mark as READ if it's currently NEW
    if (contact.status === 'NEW') {
      contact.status = 'READ';
      await contact.save();
    }

    res.status(200).json({
      success: true,
      contact
    });

  } catch (error) {
    console.error("Error fetching contact:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contact message"
    });
  }
};

/**
 * Update contact message status.
 * @function
 * @async
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['NEW', 'READ', 'REPLIED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be NEW, READ, or REPLIED"
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact status updated successfully",
      contact
    });

  } catch (error) {
    console.error("Error updating contact status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update contact status"
    });
  }
};

/**
 * Delete a contact message.
 * @function
 * @async
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByIdAndDelete(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact message deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete contact message"
    });
  }
};

/**
 * Get contact statistics for admin dashboard.
 * @function
 * @async
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
const getContactStats = async (req, res) => {
  try {
    // Get current date and calculate date ranges
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Get status counts
    const statusCounts = await Contact.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get monthly trends
    const monthlyContacts = await Contact.aggregate([
      {
        $match: {
          createdAt: { $gte: currentMonth }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Get recent contacts
    const recentContacts = await Contact.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email subject status createdAt');

    const stats = {
      statusCounts: {
        NEW: 0,
        READ: 0,
        REPLIED: 0,
        TOTAL: 0
      },
      monthlyTrends: monthlyContacts,
      recentContacts
    };

    statusCounts.forEach(stat => {
      stats.statusCounts[stat._id] = stat.count;
      stats.statusCounts.TOTAL += stat.count;
    });

    res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error("Error fetching contact stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contact statistics"
    });
  }
};

export {
  submitContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
  getContactStats
}; 