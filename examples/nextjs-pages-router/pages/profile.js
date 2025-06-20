import Link from 'next/link'
import { useAnalytics } from 'use-analytics'

/**
 * Profile page component with analytics tracking
 * @returns {JSX.Element}
 */
export default function Profile() {
  const { page, track } = useAnalytics()

  /**
   * Handle button click tracking
   */
  const trackButtonClick = () => {
    track('Button on profile page clicked')
  }

  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-24 space-y-4'>
      <div>Nextjs example with analytics</div>
      <Link className='p-4 rounded-lg bg-blue-400 text-white' href={'/'}>
        Back home
      </Link>
      <button onClick={trackButtonClick} className='p-4 rounded-lg bg-orange-400 text-white'>
        Track button click
      </button>
    </main>
  )
}