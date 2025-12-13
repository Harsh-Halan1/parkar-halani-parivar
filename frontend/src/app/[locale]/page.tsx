import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function HomePage() {
  const t = await getTranslations();

  const features = [
    { key: 'feature1', icon: '🌳' },
    { key: 'feature2', icon: '📅' },
    { key: 'feature3', icon: '🤝' },
    { key: 'feature4', icon: '📚' },
    { key: 'feature5', icon: '🔒' },
    { key: 'feature6', icon: '📱' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-20 md:py-32">
        <div className="absolute inset-0 -z-10 bg-gradient-primary opacity-20 blur-3xl"></div>
        
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 dark:text-white md:text-6xl">
            <span className="text-gradient-primary">{t('home.heroTitle')}</span>
          </h1>
          <p className="mb-8 text-xl text-gray-600 dark:text-gray-300">{t('home.heroSubtitle')}</p>
          <p className="mb-12 text-lg text-gray-500 dark:text-gray-400">{t('home.heroDescription')}</p>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="w-full sm:w-auto bg-gradient-primary">
              {t('home.getStarted')}
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              {t('common.search')}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 px-6 py-20 dark:bg-gray-950 md:py-32">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
              {t('home.featuresTitle')}
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.key} className="border border-gray-200 bg-white transition-all hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
                <CardHeader>
                  <div className="mb-4 text-4xl">{feature.icon}</div>
                  <CardTitle>{t(`home.${feature.key}Title`)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {t(`home.${feature.key}Description`)}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-primary px-6 py-20 text-white md:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-4xl font-bold">{t('home.ctaTitle')}</h2>
          <p className="mb-8 text-lg opacity-90">{t('home.ctaDescription')}</p>
          <Button size="lg" variant="secondary" className="w-full sm:w-auto">
            {t('home.joinNow')}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-6 py-12 dark:border-gray-800 dark:bg-black">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            &copy; 2024 {t('common.appName')}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
