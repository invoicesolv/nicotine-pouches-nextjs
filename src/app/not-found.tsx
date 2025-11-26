import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 - Page Not Found | Nicotine Pouches',
  description: 'The page you are looking for could not be found. Browse our nicotine pouches collection or return to the homepage.',
  robots: 'noindex, nofollow'
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-3xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
          <p className="text-gray-600 text-lg">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>

        {/* Search Suggestion */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">What would you like to do?</h3>
          <div className="space-y-3">
            <Link 
              href="/"
              className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Go to Homepage
            </Link>
            <Link 
              href="/product"
              className="block w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
            >
              Browse Products
            </Link>
            <Link 
              href="/brand"
              className="block w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
            >
              View Brands
            </Link>
            <Link 
              href="/compare"
              className="block w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
            >
              Compare Products
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className="text-center">
          <p className="text-gray-500 mb-4">
            Still can't find what you're looking for?
          </p>
          <Link 
            href="/contact-us"
            className="text-blue-600 hover:text-blue-700 font-medium underline"
          >
            Contact our support team
          </Link>
        </div>
      </div>
    </div>
  )
}
