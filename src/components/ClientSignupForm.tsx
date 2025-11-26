'use client';

import dynamic from 'next/dynamic';

// Dynamically import SignupForm with no SSR to avoid breaking server-side rendering
const SignupForm = dynamic(() => import('./SignupForm'), {
  ssr: false,
  loading: () => <div style={{ minHeight: '60px' }}></div>
});

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
