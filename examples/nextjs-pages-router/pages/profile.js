import Link from 'next/link'
import { useAnalytics } from 'use-analytics'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function Profile() {
  const { track } = useAnalytics()

  const trackButtonClick = () => {
    track('Button on profile page clicked')
  }

  return (
    <main className={`flex min-h-screen flex-col items-center justify-center p-24 space-y-4 ${inter.className}`}>
      <div>Next.js Pages Router example with analytics</div>
      <Link className='p-4 rounded-lg bg-blue-400 text-white' href={"/"}>Back home</Link>
      <button onClick={trackButtonClick} className="p-4 rounded-lg bg-orange-400 text-white">Track button click</button>
    </main>
  )
}