

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
