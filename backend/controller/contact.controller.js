

// Contact Message Handler
// Add to user.controller.js or contact.controller.js
import Contact from '../model/contact.model.js'; // make sure the model exists and is imported correctly

export const createContactMessage = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const newMessage = new Contact({ name, email, message });
    await newMessage.save();

    res.status(201).json({ message: 'Message received. Thank you!' });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({ message: 'Server error, please try again later.' });
  }
};

export const getAllContactMessages = async (req, res, next) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    res.status(500).json({ message: 'Server error, please try again later.' });
  }
};

export const deleteContactMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const message = await Contact.findById(id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found.' });
    }
    
    await Contact.findByIdAndDelete(id);
    res.status(200).json({ message: 'Contact message deleted successfully!' });
  } catch (error) {
    console.error("Error deleting contact message:", error);
    res.status(500).json({ message: 'Server error, please try again later.' });
  }
};