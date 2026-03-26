import { Request, Response, NextFunction } from 'express'
import Artwork from '@/models/Artwork'
import { createError } from '@/middleware/errorHandler'
import { createLogger } from '@/utils/logger'

const logger = createLogger('ArtworkController')

export const getArtworks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, creator, limit = 20, page = 1 } = req.query
    const query: any = {}

    if (category) query['metadata.category'] = category
    if (creator) query.creator = creator

    const artworks = await Artwork.find(query)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 })

    const total = await Artwork.countDocuments(query)

    res.json({
      success: true,
      data: artworks,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    logger.error('Failed to fetch artworks:', error)
    next(createError('Failed to fetch artworks', 500))
  }
}

export const getArtworkById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const artwork = await Artwork.findOne({ id })

    if (!artwork) {
      return next(createError('Artwork not found', 404))
    }

    res.json({
      success: true,
      data: artwork
    })
  } catch (error) {
    logger.error(`Failed to fetch artwork ${req.params.id}:`, error)
    next(createError('Failed to fetch artwork', 500))
  }
}

export const createArtwork = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const artworkData = req.body
    const authRequest = req as any

    if (artworkData.creator !== authRequest.user?.address) {
      return next(createError('Forbidden: Creator address must match authenticated user', 403))
    }

    const existingArtwork = await Artwork.findOne({ id: artworkData.id })
    if (existingArtwork) {
      return next(createError('Artwork with this ID already exists', 409))
    }

    const artwork = await Artwork.create(artworkData)

    res.status(201).json({
      success: true,
      data: artwork
    })
  } catch (error) {
    logger.error('Failed to create artwork:', error)
    next(createError('Failed to create artwork', 400))
  }
}

export const updateArtwork = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const authRequest = req as any

    const existingArtwork = await Artwork.findOne({ id })
    if (!existingArtwork) {
      return next(createError('Artwork not found', 404))
    }

    if (existingArtwork.creator !== authRequest.user?.address) {
      return next(createError('Forbidden: You can only update your own artworks', 403))
    }

    const artwork = await Artwork.findOneAndUpdate({ id }, req.body, { new: true, runValidators: true })

    if (!artwork) {
      return next(createError('Artwork not found', 404))
    }

    res.json({
      success: true,
      data: artwork
    })
  } catch (error) {
    logger.error(`Failed to update artwork ${req.params.id}:`, error)
    next(createError('Failed to update artwork', 400))
  }
}

export const deleteArtwork = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const authRequest = req as any

    const existingArtwork = await Artwork.findOne({ id })
    if (!existingArtwork) {
      return next(createError('Artwork not found', 404))
    }

    if (existingArtwork.creator !== authRequest.user?.address) {
      return next(createError('Forbidden: You can only delete your own artworks', 403))
    }

    const artwork = await Artwork.findOneAndDelete({ id })

    res.json({
      success: true,
      message: 'Artwork deleted successfully'
    })
  } catch (error) {
    logger.error(`Failed to delete artwork ${req.params.id}:`, error)
    next(createError('Failed to delete artwork', 500))
  }
}
