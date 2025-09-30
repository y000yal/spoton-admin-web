// User validation utility functions and messages

export const USER_VALIDATION_MESSAGES = {
  email: {
    unique: "This email address is already registered.",
    required: "The email field is required.",
    email: "Please enter a valid email address."
  },
  mobile_no: {
    unique: "This mobile number is already registered.",
    max: "Mobile number cannot exceed 20 characters."
  },
  country_id: {
    exists: "The selected country is invalid."
  },
  date_of_birth: {
    before: "The date of birth must be before today.",
    date: "Please enter a valid date."
  },
  gender: {
    in: "The selected gender is invalid."
  },
  role_id: {
    exists: "The selected role is invalid.",
    required: "The role field is required."
  },
  address: {
    max: "Address cannot exceed 500 characters."
  },
  longitude: {
    max: "Longitude cannot exceed 50 characters."
  },
  latitude: {
    max: "Latitude cannot exceed 50 characters."
  },
  preferred_sports: {
    max: "Preferred sports cannot exceed 500 characters."
  },
  emergency_contact_name: {
    max: "Emergency contact name cannot exceed 255 characters."
  },
  emergency_contact_no: {
    max: "Emergency contact number cannot exceed 20 characters."
  },
  emergency_contact_relationship: {
    max: "Emergency contact relationship cannot exceed 100 characters."
  },
  terms_and_condition_acceptance: {
    max: "Terms and conditions acceptance cannot exceed 50 characters."
  },
  privacy_policy_acceptance: {
    max: "Privacy policy acceptance cannot exceed 50 characters."
  }
};

export const USER_VALIDATION_RULES = {
  // Create user validation rules
  create: {
    role_id: { required: true },
    mobile_no: { maxLength: 20, unique: true },
    date_of_birth: { beforeToday: true },
    gender: { options: ['male', 'female', 'other', 'prefer_not_to_say'] },
    country_id: { exists: true },
    address: { maxLength: 500 },
    longitude: { maxLength: 50 },
    latitude: { maxLength: 50 },
    preferred_sports: { maxLength: 500 },
    emergency_contact_name: { maxLength: 255 },
    emergency_contact_no: { maxLength: 20 },
    emergency_contact_relationship: { maxLength: 100 },
    terms_and_condition_acceptance: { maxLength: 50 },
    privacy_policy_acceptance: { maxLength: 50 }
  },
  
  // Update user validation rules
  update: {
    role_id: { required: true },
    mobile_no: { maxLength: 20, unique: true },
    date_of_birth: { beforeToday: true },
    gender: { options: ['male', 'female', 'other', 'prefer_not_to_say'] },
    country_id: { exists: true },
    address: { maxLength: 500 },
    longitude: { maxLength: 50 },
    latitude: { maxLength: 50 },
    preferred_sports: { maxLength: 500 },
    emergency_contact_name: { maxLength: 255 },
    emergency_contact_no: { maxLength: 20 },
    emergency_contact_relationship: { maxLength: 100 },
    terms_and_condition_acceptance: { maxLength: 50 },
    privacy_policy_acceptance: { maxLength: 50 }
  }
};

// Helper function to get validation message
export const getValidationMessage = (field: string, rule: string): string => {
  const fieldMessages = USER_VALIDATION_MESSAGES[field as keyof typeof USER_VALIDATION_MESSAGES];
  if (fieldMessages && fieldMessages[rule as keyof typeof fieldMessages]) {
    return fieldMessages[rule as keyof typeof fieldMessages] as string;
  }
  return `Validation error for ${field}`;
};

// Helper function to validate date of birth
export const validateDateOfBirth = (dateString: string): boolean => {
  if (!dateString) return true; // Optional field
  const date = new Date(dateString);
  const today = new Date();
  return date < today;
};

// Helper function to validate field length
export const validateFieldLength = (value: string, maxLength: number): boolean => {
  if (!value) return true; // Optional field
  return value.length <= maxLength;
};
