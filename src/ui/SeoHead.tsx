import { Helmet } from 'react-helmet-async';
import { usePortfolio } from '../contexts/PortfolioContext';

export const SeoHead = () => {
  const { seoSettings } = usePortfolio();

  if (!seoSettings) return null;

  return (
    <Helmet>
      {seoSettings.title && <title>{seoSettings.title}</title>}
      {seoSettings.description && <meta name="description" content={seoSettings.description} />}
      {seoSettings.keywords && <meta name="keywords" content={seoSettings.keywords} />}
      
      {/* Open Graph / Facebook / LinkedIn */}
      {seoSettings.title && <meta property="og:title" content={seoSettings.title} />}
      {seoSettings.description && <meta property="og:description" content={seoSettings.description} />}
      {seoSettings.og_image && <meta property="og:image" content={seoSettings.og_image} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content={seoSettings.twitter_card || 'summary_large_image'} />
      {seoSettings.title && <meta name="twitter:title" content={seoSettings.title} />}
      {seoSettings.description && <meta name="twitter:description" content={seoSettings.description} />}
      {seoSettings.og_image && <meta name="twitter:image" content={seoSettings.og_image} />}
    </Helmet>
  );
};
