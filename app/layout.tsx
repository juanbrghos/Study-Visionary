import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VISIONARY BARBER SHOP | Reserva y Gestión',
  description: 'Barbería urbana premium. Sedes en Zona 6 y Zona 5, Ciudad de Guatemala. Cortes de precisión, barba, tatuajes, uñas y colorimetría.',
  icons: {
    icon: '/logo.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark scroll-smooth">
      <body className="min-h-screen bg-[#09090b] text-[#f4f4f5] antialiased">
        {children}
      </body>
    </html>
  );
}

