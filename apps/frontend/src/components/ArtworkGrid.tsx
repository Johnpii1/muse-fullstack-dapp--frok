import { useEffect } from 'react'
import { Artwork } from '@/types'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { ArtworkCard, type ArtworkCardProps } from '@/components/artwork/ArtworkCard'
import { Grid } from '@/components/layout/Grid'
import { LoadingCard } from '@/components/ui/Loading'
import { EmptyState } from './EmptyState'
import { ArtworkGridProps } from '@/types'

export function ArtworkGrid({
  artworks,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onPurchase,
  onView,
  onClearFilters,
  hasFilters = false,
  cardVariant = 'default',
  showPrice = true,
  showCreator = false,
  loadingCount = 8
}: ArtworkGridProps) {
  const loadMoreRef = useIntersectionObserver({
    onIntersect: onLoadMore,
    enabled: hasNextPage && !isFetchingNextPage,
    rootMargin: '200px',
  })

  // Show skeleton on initial load
  if (isLoading && artworks.length === 0) {
    return <LoadingCard count={loadingCount} variant="artwork" />
  }

  // Show empty state when no artworks
  if (!isLoading && artworks.length === 0) {
    return (
      <EmptyState
        type={hasFilters ? 'no-results' : 'no-artworks'}
        onClearFilters={onClearFilters}
      />
    )
  }

  return (
    <>
      <Grid responsive gap="md">
        {artworks.map((artwork) => (
          <ArtworkCard
            key={artwork.id}
            artwork={artwork}
            variant={cardVariant}
            onPurchase={onPurchase}
            onView={onView}
            showPrice={showPrice}
            showCreator={showCreator}
          />
        ))}
      </Grid>

      {/* Loading indicator for infinite scroll */}
      {isFetchingNextPage && <LoadingCard count={4} variant="artwork" />}

      {/* Intersection observer target */}
      {hasNextPage && !isFetchingNextPage && (
        <div ref={loadMoreRef} className="w-full h-4" />
      )}

      {/* End of results message */}
      {!hasNextPage && !isLoading && artworks.length > 0 && (
        <div className="text-center py-8 text-secondary-600 text-mobile-sm">
          You've reached the end of the collection
        </div>
      )}
    </>
  )
}
