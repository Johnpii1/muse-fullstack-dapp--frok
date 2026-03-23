import { useState, useCallback } from 'react'
import { useArtworks, ArtworksFilters } from '@/services/artworkService'
import { ArtworkGrid } from '@/components/ArtworkGrid'
import { Artwork } from '@/services/artworkService'

export function ExplorePage() {
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<ArtworksFilters>({})

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useArtworks(filters)

  const handleFilterChange = useCallback((key: keyof ArtworksFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
    }))
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilters({})
  }, [])

  const handlePurchase = useCallback((artwork: Artwork) => {
    console.log('Purchase artwork:', artwork)
    // TODO: Implement purchase flow
  }, [])

  const artworks = data?.pages.flatMap(page => page.data) || []
  const hasActiveFilters = Object.keys(filters).some(key => filters[key as keyof ArtworksFilters] !== undefined)

  return (
    <div className="min-h-screen bg-background">
      <div className="mobile-section">
        <div className="flex items-center justify-between mb-6">
          <h1 className="heading-mobile">Explore Artworks</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-outline text-sm px-4 py-2 touch-manipulation"
          >
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>
        
        {/* Mobile Filters */}
        {showFilters && (
          <div className="mb-6 p-4 bg-secondary-50 rounded-lg">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Category</label>
                <select 
                  className="input w-full"
                  value={filters.category || 'all'}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="abstract">Abstract</option>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                  <option value="fantasy">Fantasy</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Price Range</label>
                <select 
                  className="input w-full"
                  value={filters.priceRange || 'all'}
                  onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                >
                  <option value="all">Any Price</option>
                  <option value="0-0.1">0 - 0.1 ETH</option>
                  <option value="0.1-0.5">0.1 - 0.5 ETH</option>
                  <option value="0.5-1">0.5 - 1 ETH</option>
                  <option value="1+">1+ ETH</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Sort By</label>
                <select 
                  className="input w-full"
                  value={filters.sortBy || 'all'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <option value="all">Recently Created</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>
          </div>
        )}
        
        {/* Desktop Filters (hidden on mobile) */}
        <div className="hidden lg:block">
          <div className="lg:w-64 space-y-6 mb-8">
            <div>
              <h3 className="font-semibold text-secondary-900 mb-3">Filters</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Category</label>
                  <select 
                    className="input w-full"
                    value={filters.category || 'all'}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    <option value="abstract">Abstract</option>
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                    <option value="fantasy">Fantasy</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Price Range</label>
                  <select 
                    className="input w-full"
                    value={filters.priceRange || 'all'}
                    onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                  >
                    <option value="all">Any Price</option>
                    <option value="0-0.1">0 - 0.1 ETH</option>
                    <option value="0.1-0.5">0.1 - 0.5 ETH</option>
                    <option value="0.5-1">0.5 - 1 ETH</option>
                    <option value="1+">1+ ETH</option>
                </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Sort By</label>
                  <select 
                    className="input w-full"
                    value={filters.sortBy || 'all'}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  >
                    <option value="all">Recently Created</option>
                    <option value="price-low-high">Price: Low to High</option>
                    <option value="price-high-low">Price: High to Low</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Artwork Grid */}
        <ArtworkGrid
          artworks={artworks}
          isLoading={isLoading}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={fetchNextPage}
          onPurchase={handlePurchase}
          onClearFilters={handleClearFilters}
          hasFilters={hasActiveFilters}
        />
      </div>
    </div>
  )
}
