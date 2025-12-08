'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import apiClient from '@/lib/api';

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/login', {
        identifier,
        password,
      });

      if (response.data.requiresVerification) {
        // Redirect to OTP verification
        router.push(`/verify-otp?userId=${response.data.userId}`);
      } else {
        // Save tokens
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        
        // Redirect to dashboard
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('common.login')}</CardTitle>
          <CardDescription>{t('common.welcome')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('auth.emailOrPhone')}
              </label>
              <Input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={t('auth.emailOrPhone')}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('auth.password')}
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.password')}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('common.loading') : t('common.login')}
            </Button>

            <div className="text-center text-sm">
              <a href="#" className="text-primary hover:underline">
                {t('auth.forgotPassword')}
              </a>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button type="button" variant="outline" className="w-full">
              {t('auth.signInWithGoogle')}
            </Button>

            <div className="text-center text-sm">
              {t('auth.dontHaveAccount')}{' '}
              <a href="/register" className="text-primary hover:underline">
                {t('common.register')}
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
