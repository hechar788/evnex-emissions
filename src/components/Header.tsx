/**
 * @fileoverview Application header component.
 *
 * Displays the main application title and branding.
 * Used in the root layout across all pages.
 */

interface HeaderProps {
  centered?: boolean
}

export default function Header({ centered = false }: HeaderProps) {
  return (
    <header className="bg-white">
      <div className={`container mx-auto px-4 py-4 ${centered ? 'text-center' : ''}`}>
        <div className="inline-block relative">
          <div className="pb-4">
            <div className="absolute bottom-0 left-0 right-0 border-b border-gray-200" style={{ left: '5%', right: '5%' }}></div>
            <h1 className="text-2xl font-bold text-gray-900">
              Live Emissions & Generation Mix Dashboard
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Real-time comparison of New Zealand and Australia
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
