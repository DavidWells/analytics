import Link from 'next/link'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <main className={`flex min-h-screen flex-col items-center justify-center p-24 space-y-4 ${inter.className}`}>
      <div>Next.js Pages Router example with analytics</div>
      <Link className='p-4 rounded-lg bg-blue-400 text-white' href={"/profile"}>Go to profile page</Link>
    </main>
  )
}