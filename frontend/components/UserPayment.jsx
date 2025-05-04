import React from 'react';
import { useForm, Controller } from 'react-hook-form';

const UserPayment = ({
  savedCards = [],
  setSavedCards,
  showAddCard,
  setShowAddCard,
  newCard,
  setNewCard,
  handleNewCardChange,
  handleCardFormSubmit,
  handleEditCard,
  handleDeleteCard,
  handleSetDefaultCard,
  currentUser,
  handleUpdateCard,
  handleAddCard
}) => {
  // Add React Hook Form
  const { 
    control, 
    handleSubmit, 
    formState: { errors }, 
    reset,
    setValue
  } = useForm({
    defaultValues: {
      cardNumber: newCard.cardNumber || '',
      expiryDate: newCard.expiryDate || '',
    }
  });

  // Update form values when newCard changes
  React.useEffect(() => {
    if (showAddCard) {
      setValue('cardNumber', newCard.cardNumber || '');
      setValue('expiryDate', newCard.expiryDate || '');
    }
  }, [newCard, showAddCard, setValue]);

  // Custom submit handler that combines React Hook Form with existing submission logic
  const onSubmit = (data) => {
    // Create a synthetic event to maintain compatibility with existing handleCardFormSubmit
    const syntheticEvent = {
      preventDefault: () => {}
    };
    
    // Call the original form submission handler
    handleCardFormSubmit(syntheticEvent);
  };

  // Credit card input formatter
  const formatCreditCard = (value) => {
    if (!value) return value;
    // Remove all non-digits
    const v = value.replace(/\D/g, '');
    // Add space after every 4 digits
    const formatted = v.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.substring(0, 19); // Limit to 16 digits + 3 spaces
  };

  // Expiry date formatter (MM/YY)
  const formatExpiryDate = (value) => {
    if (!value) return value;
    // Remove all non-digits
    const v = value.replace(/\D/g, '');
    // Add slash after first 2 digits
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  // Custom handlers that update both form state and original state
  const handleCardNumberChange = (e) => {
    const formattedValue = formatCreditCard(e.target.value);
    // Update original state handler
    handleNewCardChange({
      target: {
        name: 'cardNumber',
        value: formattedValue
      }
    });
    return formattedValue;
  };

  const handleExpiryDateChange = (e) => {
    const formattedValue = formatExpiryDate(e.target.value);
    // Update original state handler
    handleNewCardChange({
      target: {
        name: 'expiryDate',
        value: formattedValue
      }
    });
    return formattedValue;
  };

  // Validation functions
  const validateCardNumber = (value) => {
    // Basic credit card validation (checks for 16 digits without spaces)
    if (!value) return "Card number is required";
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length !== 16) return "Card number must be 16 digits";
    return true;
  };

  const validateExpiryDate = (value) => {
    if (!value) return "Expiry date is required";
    
    // Check format
    if (!/^\d{2}\/\d{2}$/.test(value)) return "Format must be MM/YY";
    
    const [month, year] = value.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
    const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
    
    // Convert to numbers
    const numMonth = parseInt(month, 10);
    const numYear = parseInt(year, 10);
    
    // Validate month
    if (numMonth < 1 || numMonth > 12) return "Invalid month";
    
    // Validate year
    if (numYear < currentYear) return "Card has expired";
    
    // If same year, check if month has passed
    if (numYear === currentYear && numMonth < currentMonth) return "Card has expired";
    
    return true;
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg overflow-hidden border border-amber-100 transition-all duration-300 hover:shadow-xl">
      <div className="px-6 py-5 flex justify-between items-center border-b border-amber-100">
        <h2 className="text-xl font-bold bg-gradient-to-r from-amber-500 to-amber-700 bg-clip-text text-transparent">Payment Methods</h2>
        <button
          onClick={() => {
            setNewCard({
              cardNumber: '',
              cardholderName: '',
              expiryDate: '',
              cvc: ''
            });
            setShowAddCard(!showAddCard);
            reset();
          }}
          className={`text-sm transition-all duration-300 flex items-center font-medium ${
            showAddCard 
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 px-3 py-1.5 rounded-full' 
              : 'bg-amber-500 text-white hover:bg-amber-600 px-3 py-1.5 rounded-full'
          }`}
        >
          {showAddCard ? (
            <React.Fragment>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
              </React.Fragment>
          ) : (
            <React.Fragment>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Card
            </React.Fragment>
          )}
        </button>
      </div>
      <div className="p-6">
        {/* Add/Edit Card Form */}
        {showAddCard && (
          <div className="mb-6 bg-gradient-to-br from-amber-50 to-amber-100/30 p-6 rounded-2xl shadow-sm border border-amber-100 animate-fadeIn">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              {newCard.cardId ? 'Update Card Details' : 'Add New Card'}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {!newCard.cardId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <Controller
                      name="cardNumber"
                      control={control}
                      rules={{ validate: validateCardNumber }}
                      render={({ field }) => (
                        <input
                          type="text"
                          {...field}
                          onChange={(e) => field.onChange(handleCardNumberChange(e))}
                          className={`w-full pl-10 p-3 bg-white border ${errors.cardNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-amber-500'} rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition`}
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                          disabled={!!newCard.cardId}
                          required={!newCard.cardId}
                        />
                      )}
                    />
                  </div>
                  {errors.cardNumber && (
                    <p className="mt-1 text-red-600 text-xs">{errors.cardNumber.message}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <Controller
                    name="expiryDate"
                    control={control}
                    rules={{ validate: validateExpiryDate }}
                    render={({ field }) => (
                      <input
                        type="text"
                        {...field}
                        onChange={(e) => field.onChange(handleExpiryDateChange(e))}
                        className={`w-full pl-10 p-3 bg-white border ${errors.expiryDate ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-amber-500'} rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition`}
                        placeholder="MM/YY"
                        maxLength="5"
                        required
                      />
                    )}
                  />
                </div>
                {errors.expiryDate && (
                  <p className="mt-1 text-red-600 text-xs">{errors.expiryDate.message}</p>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:shadow-lg hover:from-amber-600 hover:to-amber-700 transition flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {newCard.cardId ? 'Update Card' : 'Save Card'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Saved Cards */}
        <div>
          <h3 className="text-sm uppercase tracking-wider text-amber-700/70 font-semibold mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Saved Payment Methods
          </h3>
          
          {savedCards.length === 0 ? (
            <div className="bg-gradient-to-br from-amber-50 to-amber-100/30 rounded-2xl p-8 text-center border border-amber-100">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100/70 text-amber-600 rounded-full mb-4 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-5">No payment methods saved yet</p>
              <button
                onClick={() => setShowAddCard(true)}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full hover:shadow-lg hover:from-amber-600 hover:to-amber-700 transition font-medium focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              >
                Add a Card
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {savedCards.map(card => (
                <div
                  key={card._id}
                  className={`relative p-5 rounded-2xl transition-all duration-300 group ${
                    card.isDefault
                      ? 'bg-gradient-to-r from-amber-100/80 to-amber-50/70 border border-amber-200'
                      : 'bg-white hover:bg-amber-50/30 border border-gray-100 hover:border-amber-200'
                  }`}
                >
                  {/* Card design with embossed credit card look */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      {/* Card logo - more realistic credit card icon */}
                      <div className="w-14 h-10 flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-900 rounded-lg shadow-sm mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>

                      {/* Card details */}
                      <div>
                        <div className="text-lg font-medium text-gray-800 font-mono tracking-wider">
                          •••• •••• •••• {card.cardNumber.slice(-4)}
                        </div>
                        <div className="text-sm text-gray-500 mt-1 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Expires {card.expiryDate}
                        </div>
                      </div>
                    </div>

                    {/* Default badge with animation */}
                    {card.isDefault && (
                      <span className="bg-gradient-to-r from-amber-200 to-amber-300 text-amber-800 text-xs font-medium px-3 py-1 rounded-full border border-amber-300 shadow-sm">
                        Default
                      </span>
                    )}
                  </div>

                  {/* Action buttons - improved with animations */}
                  <div className="mt-5 flex space-x-2 justify-end">
                    {!card.isDefault && (
                      <button
                      onClick={() => {
                        console.log('Card object:', card); 
                        if (card && card._id) {
                          handleSetDefaultCard(card._id);
                        } else {
                          console.error('Card or card ID is undefined:', card);
                        }
                      }}
                      className="text-xs bg-white text-amber-600 border border-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-all duration-200 hover:shadow-sm flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Set Default
                    </button>
                    )}
                    <button
                      onClick={() => {
                        handleEditCard(card);
                        // Also reset form values when editing a card
                        setValue('expiryDate', card.expiryDate || '');
                      }}
                      className="text-xs bg-white text-blue-600 border border-blue-300 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all duration-200 hover:shadow-sm flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                          </button>
                          <button
                              onClick={() => handleDeleteCard(card._id)}
                              className="text-xs bg-white text-red-600 border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all duration-200 hover:shadow-sm flex items-center"
                          >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                          </button>
                      </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPayment;