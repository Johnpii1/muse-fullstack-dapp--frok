import { Request, Response, NextFunction } from 'express'
import User from '@/models/User'
import { createError } from '@/middleware/errorHandler'
import { invalidateUserCache } from '@/middleware/cacheMiddleware'
import { createLogger } from '@/utils/logger'

const logger = createLogger('UserController')

export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params
    let user = await User.findOne({ address })

    // In many apps we create a profile on the fly if it doesn't exist upon request
    if (!user) {
      user = await User.create({
        address,
        username: 'New Artist',
        bio: 'Exploring AI Art'
      })
    }

    res.json({
      success: true,
      data: user,
    })
  } catch (error) {
    logger.error(`Failed to fetch user profile for ${req.params.address}:`, error)
    next(createError('Failed to fetch user profile', 500))
  }
}

export const updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params
    const { username, bio, profileImage } = req.body

    const authRequest = req as any
    if (authRequest.user?.address !== address) {
      return next(createError('Forbidden: You can only update your own profile', 403))
    }

    const user = await User.findOneAndUpdate(
      { address },
      { username, bio, profileImage, updatedAt: new Date() },
      { new: true, runValidators: true, upsert: true }
    )

    res.json({
      success: true,
      data: user,
    })

    // Invalidate user cache after profile update
    invalidateUserCache(address).catch(error => 
      logger.error('Failed to invalidate cache after profile update:', error)
    )
  } catch (error) {
    logger.error(`Failed to update user profile for ${req.params.address}:`, error)
    next(createError('Failed to update user profile', 500))
  }
}
