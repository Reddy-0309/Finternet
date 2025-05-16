import React from 'react';

function PasswordStrengthMeter({ password }) {
  // Calculate password strength
  const calculateStrength = (password) => {
    if (!password) return 0;
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 1; // Has uppercase
    if (/[a-z]/.test(password)) strength += 1; // Has lowercase
    if (/[0-9]/.test(password)) strength += 1; // Has number
    if (/[^A-Za-z0-9]/.test(password)) strength += 1; // Has special char
    
    return Math.min(strength, 5); // Max strength is 5
  };
  
  const strength = calculateStrength(password);
  
  // Get appropriate color and label based on strength
  const getStrengthInfo = (strength) => {
    switch (strength) {
      case 0:
        return { color: 'bg-gray-200 dark:bg-gray-600', label: 'None', width: '0%' };
      case 1:
        return { color: 'bg-red-500', label: 'Very Weak', width: '20%' };
      case 2:
        return { color: 'bg-orange-500', label: 'Weak', width: '40%' };
      case 3:
        return { color: 'bg-yellow-500', label: 'Medium', width: '60%' };
      case 4:
        return { color: 'bg-blue-500', label: 'Strong', width: '80%' };
      case 5:
        return { color: 'bg-green-500', label: 'Very Strong', width: '100%' };
      default:
        return { color: 'bg-gray-200 dark:bg-gray-600', label: 'None', width: '0%' };
    }
  };
  
  const strengthInfo = getStrengthInfo(strength);
  
  // Password requirements
  const requirements = [
    { label: 'At least 8 characters', met: password && password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains number', met: /[0-9]/.test(password) },
    { label: 'Contains special character', met: /[^A-Za-z0-9]/.test(password) }
  ];
  
  return (
    <div className="mt-2 mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-600 dark:text-gray-300">Password Strength</span>
        <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{strengthInfo.label}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${strengthInfo.color} transition-all duration-300 ease-in-out`} 
          style={{ width: strengthInfo.width }}
        ></div>
      </div>
      
      {password && (
        <div className="mt-3">
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">Requirements:</p>
          <ul className="text-xs space-y-1">
            {requirements.map((req, index) => (
              <li key={index} className="flex items-center">
                <span className={`mr-2 ${req.met ? 'text-green-500' : 'text-gray-400 dark:text-gray-500'}`}>
                  {req.met ? '✓' : '○'}
                </span>
                <span className={`${req.met ? 'text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                  {req.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default PasswordStrengthMeter;
