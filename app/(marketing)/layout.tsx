import '@/app/globals.css';

export const metadata = {
  title: 'Cevace - Jouw AI Carrière Assistent',
  description: 'Professionele CV\'s en motivatiebrieven binnen minuten met AI',
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}
