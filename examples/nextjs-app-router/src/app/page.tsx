import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 space-y-4">
      <div>Nextjs example with analytics</div>
      <Link className='p-4 rounded-lg bg-blue-400 text-white' href={"/profile"}>Go to profile page</Link>
    </main>
  )
}
