import { Router } from 'express'
import { getUserProfile, updateUserProfile } from '@/controllers/userController'
import { userProfileCache } from '@/middleware/cacheMiddleware'
import { authenticate } from '@/middleware/authMiddleware'
import { validate } from '@/middleware/validate'
import { getProfileSchema, updateProfileSchema } from '@/schemas/userSchemas'

const router = Router()

/**
 * @openapi
 * /api/users/profile/{address}:
 *   get:
 *     summary: Get user profile
 *     description: Retrieve profile information for a specific Stellar address
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile found
 *       404:
 *         description: User not found
 */
router.get('/profile/:address', validate(getProfileSchema), userProfileCache, getUserProfile)

/**
 * @openapi
 * /api/users/profile/{address}:
 *   put:
 *     summary: Update user profile
 *     description: Update profile information (Requires Authentication)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/profile/:address', authenticate, validate(updateProfileSchema), updateUserProfile)

export default router
