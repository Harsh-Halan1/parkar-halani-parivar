// File: frontend/src/components/MobileAppDownload.tsx
// Mobile app download section for website

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, Apple, Monitor } from 'lucide-react';

interface AppDownloadLink {
  platform: 'android' | 'ios' | 'web';
  url: string;
  version: string;
  size: string;
  releaseDate: string;
}

interface MobileAppDownloadProps {
  appVersion?: string;
  showQRCode?: boolean;
}

export function MobileAppDownload({
  appVersion = '1.0.0',
  showQRCode = true,
}: MobileAppDownloadProps) {
  const t = useTranslations();

  // Example download links - update these with your actual URLs
  const downloadLinks: Record<string, AppDownloadLink> = {
    android: {
      platform: 'android',
      url: 'https://your-domain.com/downloads/parkar-halani-v1.0.0.apk',
      version: appVersion,
      size: '45 MB',
      releaseDate: 'Dec 2025',
    },
    android_play_store: {
      platform: 'android',
      url: 'https://play.google.com/store/apps/details?id=com.parkarhalani.mobile',
      version: appVersion,
      size: '45 MB',
      releaseDate: 'Dec 2025',
    },
    ios: {
      platform: 'ios',
      url: 'https://apps.apple.com/app/parkar-halani-parivar/id0000000000',
      version: appVersion,
      size: '52 MB',
      releaseDate: 'Dec 2025',
    },
    web: {
      platform: 'web',
      url: 'https://your-domain.vercel.app',
      version: appVersion,
      size: 'N/A',
      releaseDate: 'Dec 2025',
    },
  };

  const handleDownload = (platform: string, url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">{t('download.title') || 'Download Our App'}</h2>
        <p className="text-muted-foreground">
          {t('download.subtitle') || 'Keep your family connected wherever you are'}
        </p>
      </div>

      {/* Download Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Android APK Direct Download */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-green-600" />
              {t('download.android') || 'Android'}
            </CardTitle>
            <CardDescription>APK Direct Download</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('download.version')}</span>
                <span className="font-semibold">{downloadLinks.android.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('download.size')}</span>
                <span className="font-semibold">{downloadLinks.android.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('download.released')}</span>
                <span className="font-semibold">{downloadLinks.android.releaseDate}</span>
              </div>
            </div>
            <Button
              onClick={() => handleDownload('android', downloadLinks.android.url)}
              className="w-full"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              {t('download.downloadAPK') || 'Download APK'}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              {t('download.apkNote') || 'Direct download for Android phones'}
            </p>
          </CardContent>
        </Card>

        {/* Android Play Store */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-green-600" />
              {t('download.playStore') || 'Play Store'}
            </CardTitle>
            <CardDescription>Official Store</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('download.version')}</span>
                <span className="font-semibold">{downloadLinks.android_play_store.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('download.size')}</span>
                <span className="font-semibold">{downloadLinks.android_play_store.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('download.released')}</span>
                <span className="font-semibold">{downloadLinks.android_play_store.releaseDate}</span>
              </div>
            </div>
            <Button
              onClick={() => handleDownload('play-store', downloadLinks.android_play_store.url)}
              variant="outline"
              className="w-full"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              {t('download.getPlayStore') || 'Get from Play Store'}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              {t('download.autoUpdates') || 'Automatic updates & reviews'}
            </p>
          </CardContent>
        </Card>

        {/* iOS App Store */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Apple className="w-5 h-5 text-slate-900 dark:text-white" />
              {t('download.ios') || 'iOS'}
            </CardTitle>
            <CardDescription>Apple App Store</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('download.version')}</span>
                <span className="font-semibold">{downloadLinks.ios.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('download.size')}</span>
                <span className="font-semibold">{downloadLinks.ios.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('download.released')}</span>
                <span className="font-semibold">{downloadLinks.ios.releaseDate}</span>
              </div>
            </div>
            <Button
              onClick={() => handleDownload('ios', downloadLinks.ios.url)}
              className="w-full"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              {t('download.getAppStore') || 'Get from App Store'}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              {t('download.iosOnly') || 'For iPhone, iPad, and iPod Touch'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Web Version */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            {t('download.webVersion') || 'Web Version'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            {t('download.webDescription') || 'Access the web version directly without downloading'}
          </p>
          <Button
            onClick={() => handleDownload('web', downloadLinks.web.url)}
            variant="default"
            className="w-full"
          >
            <Monitor className="w-4 h-4 mr-2" />
            {t('download.openWeb') || 'Open Web Version'}
          </Button>
        </CardContent>
      </Card>

      {/* QR Code Section */}
      {showQRCode && (
        <Card>
          <CardHeader>
            <CardTitle>{t('download.scanQR') || 'Quick Download'}</CardTitle>
            <CardDescription>
              {t('download.scanDescription') || 'Scan with your phone camera to download instantly'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-lg">
              {/* Replace with actual QR code image */}
              <div className="w-40 h-40 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-500 text-sm">{t('download.qrCodePlaceholder') || 'QR Code'}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center max-w-xs">
              {t('download.qrInstructions') || 'Open your phone camera and point at the QR code above'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Features List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('download.features') || 'App Features'}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <li className="flex gap-2 text-sm">
              <span className="text-green-600">✓</span>
              <span>{t('download.feature1') || 'Offline family tree access'}</span>
            </li>
            <li className="flex gap-2 text-sm">
              <span className="text-green-600">✓</span>
              <span>{t('download.feature2') || 'Push notifications for events'}</span>
            </li>
            <li className="flex gap-2 text-sm">
              <span className="text-green-600">✓</span>
              <span>{t('download.feature3') || 'Birthday reminders'}</span>
            </li>
            <li className="flex gap-2 text-sm">
              <span className="text-green-600">✓</span>
              <span>{t('download.feature4') || 'Share family photos & documents'}</span>
            </li>
            <li className="flex gap-2 text-sm">
              <span className="text-green-600">✓</span>
              <span>{t('download.feature5') || 'Support for Gujarati, English, Hindi'}</span>
            </li>
            <li className="flex gap-2 text-sm">
              <span className="text-green-600">✓</span>
              <span>{t('download.feature6') || 'Encrypted data storage'}</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* System Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>{t('download.requirements') || 'System Requirements'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm mb-1">{t('download.androidReq')}</h4>
            <p className="text-sm text-muted-foreground">Android 7.0 (API level 24) or higher</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-1">{t('download.iosReq')}</h4>
            <p className="text-sm text-muted-foreground">iOS 12.0 or later</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-1">{t('download.webReq')}</h4>
            <p className="text-sm text-muted-foreground">Modern web browser with JavaScript enabled</p>
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
        <CardContent className="pt-6">
          <p className="text-sm">
            {t('download.support') || 'Need help?'}{' '}
            <a href="mailto:support@parkarhalani.com" className="text-amber-600 dark:text-amber-400 hover:underline">
              {t('download.contactUs') || 'Contact us'}
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
