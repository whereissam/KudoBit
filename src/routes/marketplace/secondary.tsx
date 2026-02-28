import { createFileRoute } from '@tanstack/react-router'
import { SecondaryMarketplace } from '@/components/secondary-marketplace'

export const Route = createFileRoute('/marketplace/secondary')({
  component: SecondaryMarketplacePage,
})

function SecondaryMarketplacePage() {
  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <SecondaryMarketplace />
    </div>
  )
}