'use client';

import SignupForm from './SignupForm';

interface ClientSignupFormProps {
  source: string;
  placeholder: string;
  buttonText: string;
}

const ClientSignupForm = ({ source, placeholder, buttonText }: ClientSignupFormProps) => {
  return (
    <SignupForm
      source={source}
      placeholder={placeholder}
      buttonText={buttonText}
    />
  );
};

export default ClientSignupForm;
