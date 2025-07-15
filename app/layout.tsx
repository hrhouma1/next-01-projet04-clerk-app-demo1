import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { Navbar } from '@/app/components/Navbar';


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" data-google-analytics-opt-out="">
        <body>
          <Navbar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}

