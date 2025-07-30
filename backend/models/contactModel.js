/**
 * Mongoose schema for contact form submissions.
 * Represents contact messages sent by users through the contact form.
 *
 * @module models/contactModel
 */
import mongoose from "mongoose";

/**
 * Contact schema definition.
 * @typedef {Object} Contact
 * @property {string} name - The full name of the person submitting the contact form.
 * @property {string} email - The email address of the person submitting the contact form.
 * @property {string} subject - The subject/topic of the contact message.
 * @property {string} message - The main message content.
 * @property {string} status - The status of the contact message (e.g., 'NEW', 'READ', 'REPLIED').
 * @property {Date} createdAt - Timestamp when the contact message was created.
 * @property {Date} updatedAt - Timestamp when the contact message was last updated.
 */

const contactSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true,
    trim: true,
    lowercase: true
  },
  subject: { 
    type: String, 
    required: true,
    trim: true
  },
  message: { 
    type: String, 
    required: true,
    trim: true
  },
  status: { 
    type: String, 
    enum: ['NEW', 'READ', 'REPLIED'],
    default: 'NEW'
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt field before saving
contactSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Contact = mongoose.models.Contact || mongoose.model("Contact", contactSchema);
export default Contact; 