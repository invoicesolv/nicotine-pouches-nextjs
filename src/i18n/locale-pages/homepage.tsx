import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CookieConsent from '@/components/CookieConsent';
import { CTASection } from '@/components/ui/hero-dithering-card';
import HomepageBrandLogos from '@/components/HomepageBrandLogos';
import DynamicProductSections from '@/components/DynamicProductSections';
import { LocaleContentSection } from '@/i18n/locale-pages/content-section';
import { fetchSectionProducts } from '@/lib/fetchSectionProducts';
import type { TranslatedLocale } from '@/i18n/config';

export async function HomepageLocalePage({ locale }: { locale?: TranslatedLocale }) {
  const [popularProducts, trendingProducts, newProducts] = await Promise.all([
    fetchSectionProducts('popular', 12, 0, '\u20AC', locale),
    fetchSectionProducts('trending', 12, 12, '\u20AC', locale),
    fetchSectionProducts('new', 12, 0, '\u20AC', locale),
  ]);

  return (
    <div id="boxed-wrapper" className="page-transition" suppressHydrationWarning>
      <div id="wrapper" className="fusion-wrapper" suppressHydrationWarning>
        <Header />
        <main id="main-content" suppressHydrationWarning>
          <div className="fade-in">
            <CTASection />
          </div>

          <HomepageBrandLogos />

          <DynamicProductSections
            popularProducts={popularProducts}
            trendingProducts={trendingProducts}
            newProducts={newProducts}
          />

          {locale && <LocaleContentSection locale={locale} />}
        </main>
        <Footer />
        <CookieConsent />
      </div>
    </div>
  );
}
