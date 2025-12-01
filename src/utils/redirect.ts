// utils/redirect.ts
export const safeRedirect = (url: string) => {
  if (typeof window === 'undefined') return;
  
  // Cek apakah di Vercel production
  const isVercelProduction = 
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ||
    window.location.hostname.includes('vercel.app');
  
  if (isVercelProduction) {
    // Di Vercel production, selalu gunakan hard redirect
    window.location.href = url;
  } else {
    // Di local/development, gunakan Next.js router
    const { router } = require('next/navigation');
    router.push(url);
    router.refresh();
  }
};