import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const t = useTranslations();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">
          {t('common.appName')}
        </h1>
        <p className="text-xl text-muted-foreground">
          {t('common.welcome')}
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button size="lg">{t('common.login')}</Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline">
              {t('common.register')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
