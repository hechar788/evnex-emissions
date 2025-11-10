/**
 * @fileoverview Application header component.
 *
 * Displays the main application title and branding.
 * Used in the root layout across all pages.
 */

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Live Emissions & Generation Mix Dashboard
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Real-time comparison of New Zealand and Australia
        </p>
      </div>
    </header>
  )
}
