import { createFileRoute } from '@tanstack/react-router'
import { SecondaryMarketplace } from '../components/secondary-marketplace'

export const Route = createFileRoute('/marketplace/secondary')({
  component: SecondaryMarketplacePage,
})

function SecondaryMarketplacePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <SecondaryMarketplace />
    </div>
  )
}