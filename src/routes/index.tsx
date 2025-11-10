import { createFileRoute, Link } from '@tanstack/react-router'

import Header from '@/components/Header'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header centered />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Link to="/dashboard">
          <Button size="lg" className="text-lg px-8 py-6 cursor-pointer">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
