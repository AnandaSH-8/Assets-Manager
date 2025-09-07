import React from 'react';
import { cn } from '@/lib/utils';

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ 
  password, 
  className 
}) => {
  const calculateStrength = (pwd: string) => {
    let score = 0;
    const checks = {
      length: pwd.length >= 12,
      lowercase: /[a-z]/.test(pwd),
      uppercase: /[A-Z]/.test(pwd),
      numbers: /\d/.test(pwd),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)
    };

    // Score based on criteria met
    Object.values(checks).forEach(check => {
      if (check) score += 1;
    });

    return { score, checks };
  };

  const { score, checks } = calculateStrength(password);
  
  const getStrengthLabel = () => {
    if (score === 0) return { label: '', color: '' };
    if (score <= 2) return { label: 'Weak', color: 'text-red-500' };
    if (score <= 3) return { label: 'Fair', color: 'text-yellow-500' };
    if (score <= 4) return { label: 'Good', color: 'text-blue-500' };
    return { label: 'Strong', color: 'text-green-500' };
  };

  const getStrengthColor = () => {
    if (score <= 2) return 'bg-red-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const strengthInfo = getStrengthLabel();

  if (!password) return null;

  return (
    <div className={cn("mt-2 space-y-2", className)}>
      {/* Strength bar */}
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              level <= score 
                ? getStrengthColor()
                : "bg-gray-200"
            )}
          />
        ))}
      </div>
      
      {/* Strength label */}
      <div className="flex justify-between items-center text-xs">
        <span className={strengthInfo.color}>
          {strengthInfo.label}
        </span>
        <span className="text-muted-foreground">
          {score}/5 criteria met
        </span>
      </div>

      {/* Requirements checklist */}
      <div className="space-y-1 text-xs text-muted-foreground">
        <div className={cn("flex items-center space-x-2", checks.length ? "text-green-600" : "")}>
          <span className={checks.length ? "text-green-500" : "text-gray-400"}>✓</span>
          <span>At least 12 characters</span>
        </div>
        <div className={cn("flex items-center space-x-2", checks.lowercase ? "text-green-600" : "")}>
          <span className={checks.lowercase ? "text-green-500" : "text-gray-400"}>✓</span>
          <span>Lowercase letter</span>
        </div>
        <div className={cn("flex items-center space-x-2", checks.uppercase ? "text-green-600" : "")}>
          <span className={checks.uppercase ? "text-green-500" : "text-gray-400"}>✓</span>
          <span>Uppercase letter</span>
        </div>
        <div className={cn("flex items-center space-x-2", checks.numbers ? "text-green-600" : "")}>
          <span className={checks.numbers ? "text-green-500" : "text-gray-400"}>✓</span>
          <span>Number</span>
        </div>
        <div className={cn("flex items-center space-x-2", checks.special ? "text-green-600" : "")}>
          <span className={checks.special ? "text-green-500" : "text-gray-400"}>✓</span>
          <span>Special character</span>
        </div>
      </div>
    </div>
  );
};