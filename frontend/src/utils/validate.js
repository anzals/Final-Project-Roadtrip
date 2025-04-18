// Check for a valid email format
export const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email.trim());
  };
  
  // Password should be at least 8 characters
  export const validatePassword = (password) => {
    return typeof password === 'string' && password.length >= 8;
  };
  
  // Check that both passwords match
  export const doPasswordsMatch = (password, confirmPassword) => {
    return password === confirmPassword;
  };
  
  // Ensure the date is not in the past
  export const validateFutureDate = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date().setHours(0, 0, 0, 0);
    const inputDate = new Date(dateStr).setHours(0, 0, 0, 0);
    return inputDate >= today;
  };
  
  // Make sure number is positive and not NaN
  export const validatePositiveNumber = (value) => {
    return !isNaN(value) && Number(value) > 0;
  };
  
  // Optional: check location was selected from autocomplete
  export const validatePlaceSelected = (placeDetails) => {
    return !!(placeDetails && placeDetails.formatted_address);
  };
  