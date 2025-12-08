'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { z } from 'zod';

const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Invalid phone number'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface Step {
  number: 1 | 2 | 3;
  label: string;
}

const STEPS: Step[] = [
  { number: 1, label: 'Contact' },
  { number: 2, label: 'Password' },
  { number: 3, label: 'Verify' },
];

export default function RegisterPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
    setError(null);
  };

  const validateStep1 = () => {
    try {
      const schema = z.object({
        email: z.string().email('Invalid email address'),
        phone: z
          .string()
          .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Invalid phone number'),
      });
      schema.parse({ email: formData.email, phone: formData.phone });
      setError(null);
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
      return false;
    }
  };

  const validateStep2 = () => {
    try {
      const schema = z
        .object({
          password: z.string().min(8, 'Password must be at least 8 characters'),
          confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: 'Passwords do not match',
          path: ['confirmPassword'],
        });
      schema.parse({ password: formData.password, confirmPassword: formData.confirmPassword });
      setError(null);
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
      return false;
    }
  };

  const handleSendOtp = async () => {
    if (currentStep !== 1 || !validateStep1()) return;

    try {
      setLoading(true);
      setError(null);
      await api.post('/auth/send-otp', {
        email: formData.email,
        phone: formData.phone,
      });
      setOtpSent(true);
      setCurrentStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      if (!otpSent) {
        await handleSendOtp();
      } else {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (!validateStep2()) return;
      setCurrentStep(3);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      setError(null);

      // Verify OTP
      await api.post('/auth/verify-otp', {
        email: formData.email,
        otp: otpValue,
      });

      // Register user
      await api.post('/auth/register', {
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      // Redirect to login
      router.push(`/${locale}/login?registered=true`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 3) {
      handleVerifyOtp();
    } else {
      handleNextStep();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-white mb-2">Parakar Halani</div>
          <p className="text-slate-400">Create your account</p>
        </div>

        {/* Progress Steps */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((step) => (
            <div key={step.number} className="flex-1">
              <div
                className={`h-2 rounded-full transition-colors ${
                  step.number <= currentStep ? 'bg-blue-600' : 'bg-slate-700'
                }`}
              />
              <p className="text-xs text-slate-400 mt-2 text-center">{step.label}</p>
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 shadow-lg">
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Contact Information */}
            {currentStep === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                    disabled={loading}
                  />
                </div>

                {otpSent && (
                  <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3">
                    <p className="text-green-200 text-sm">
                      OTP sent to your email and phone. Click next to continue.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Step 2: Password Setup */}
            {currentStep === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="At least 8 characters"
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                    disabled={loading}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Must contain uppercase, lowercase, numbers, and special characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                    disabled={loading}
                  />
                </div>
              </>
            )}

            {/* Step 3: OTP Verification */}
            {currentStep === 3 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Enter Verification Code
                  </label>
                  <p className="text-sm text-slate-400 mb-3">
                    We sent a code to {formData.email}
                  </p>
                  <Input
                    type="text"
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 text-center text-lg tracking-widest"
                    disabled={loading}
                  />
                </div>

                <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3">
                  <p className="text-blue-200 text-sm">
                    Check your email and phone for the verification code
                  </p>
                </div>
              </>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              {currentStep > 1 && (
                <Button
                  type="button"
                  onClick={() => {
                    if (currentStep === 3) setCurrentStep(2);
                    else if (currentStep === 2) {
                      setCurrentStep(1);
                      setOtpValue('');
                    }
                  }}
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                  disabled={loading}
                >
                  Back
                </Button>
              )}

              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading ? 'Loading...' : currentStep === 3 ? 'Complete Registration' : 'Next'}
              </Button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Already have an account?{' '}
              <Link href={`/${locale}/login`} className="text-blue-400 hover:text-blue-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>🔒 Your data is encrypted and secure</p>
        </div>
      </div>
    </div>
  );
}
