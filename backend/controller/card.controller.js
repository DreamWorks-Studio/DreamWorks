import Card from '../model/card.model.js'

export const saveCard = async (req, res) => {
    try {
        const { userId, cardNumber, expiryDate} = req.body;

        if (!userId || !cardNumber || !expiryDate) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const maskedCardNumber = '*'.repeat(12) + cardNumber.slice(-4);

        const existingCard = await Card.findOne({
            userId, 
            cardNumber: maskedCardNumber
        });

        if (existingCard) {
            return res.status(200).json({
                message: 'Card already saved',
                card: existingCard
            });
        }

        const userCards = await Card.find({ userId });
        const isDefault = userCards.length == 0;

        const newCard = new Card({
            userId,
            cardNumber: maskedCardNumber,
            expiryDate,
            isDefault
        });

        await newCard.save();

        return res.status(201).json({
            message: 'Card saved successfully',
            card: {
                id: newCard._id,
                cardNumber: newCard.cardNumber,
                expiryDate: newCard.expiryDate,
                isDefault: newCard.isDefault
            }
        });

    } catch (error) {
        console.error('Error saving card:', error);
        res.status(500).json({
            message: 'Failed to save card',
            error: error.message
        });
    }
};

export const getUserCards = async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      const cards = await Card.find({ userId }).sort({ createdAt: -1 });
      
      return res.status(200).json({
        message: 'Cards retrieved successfully',
        cards
      });
    } catch (error) {
      console.error('Error fetching user cards:', error);
      res.status(500).json({ 
        message: 'Failed to retrieve user cards', 
        error: error.message 
      });
    }
  };

export const updateCard = async (req, res) => {
    try {
        const { cardId } = req.params;
        const { expiryDate } = req.body;

        if (!cardId) {
            return res.status(400).json({ message: 'Card ID is required' });
        }

        const card = await Card.findById(cardId);

        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }

        if (expiryDate) {
            card.expiryDate = expiryDate;
        }

        await card.save();

        return res.status(200).json({
            message: 'Card updated successfully',
            card: {
                id: card._id,
                cardNumber: card.cardNumber,
                expiryDate: card.expiryDate,
                isDefault: card.isDefault
            }
        });
    } catch (error) {
        console.error('Error updating card:', error);
        return res.status(500).json({
            message: 'Failed to update card',
            error: error.message
        });
    }
};

export const deleteCard = async (req, res) => {
    try {
        const { cardId } = req.params;

        if (!cardId) {
            return res.status(400).json({ message: 'Card ID is required' });
        }

        const card = await Card.findById(cardId);

        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }

        const wasDefault = card.isDefault;
        const userId = card.userId;

        await card.deleteOne();

        if (wasDefault) {
            const anotherCard = await Card.findOne({ userId });
            if (anotherCard) {
                anotherCard.isDefault = true;
                await anotherCard.save();
            }
        }

        return res.status(200).json({
            message: 'Card deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting card:', error);
        return res.status(500).json({
            message: 'Failed to delete card',
            error: error.message
        });
    }
};

export const setDefaultCard = async (req, res) => {
    try {
        const { cardId } = req.params;
        const { userId } = req.body;

        if (!cardId || !userId) {
            return res.status(400).json({ message: 'Card ID and User ID are required' });
        }

        // First, find all user's cards and set isDefault to false
        await Card.updateMany({ userId }, { isDefault: false });

        // Then, set the selected card as default
        const card = await Card.findById(cardId);

        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }

        card.isDefault = true;
        await card.save();

        return res.status(200).json({
            message: 'Default card set successfully',
            card: {
                id: card._id,
                cardNumber: card.cardNumber,
                expiryDate: card.expiryDate,
                isDefault: card.isDefault
            }
        });
    } catch (error) {
        console.error('Error setting default card:', error);
        res.status(500).json({
            message: 'Failed to set default card',
            error: error.message
        });
    }
};