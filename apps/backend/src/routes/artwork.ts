import { Router } from 'express'
import * as artworkController from '@/controllers/artworkController'
import { artworkListCache, artworkDetailCache } from '@/middleware/cacheMiddleware'
import { authenticate } from '@/middleware/authMiddleware'
import { validate } from '@/middleware/validate'
import { 
  createArtworkSchema, 
  updateArtworkSchema, 
  getArtworkSchema, 
  artworkQuerySchema 
} from '@/schemas/artworkSchemas'

const router = Router()

/**
 * @openapi
 * /api/artworks:
 *   get:
 *     summary: Get all artworks
 *     description: Retrieve a list of artworks with pagination and filtering
 *     tags: [Artworks]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of artworks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Artwork'
 */
router.get('/', validate(artworkQuerySchema), artworkListCache, artworkController.getArtworks)

/**
 * @openapi
 * /api/artworks/{id}:
 *   get:
 *     summary: Get artwork by ID
 *     description: Retrieve detailed information about a specific artwork
 *     tags: [Artworks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detailed artwork information
 *       404:
 *         description: Artwork not found
 */
router.get('/:id', validate(getArtworkSchema), artworkDetailCache, artworkController.getArtworkById)

// Protected routes (require auth)

/**
 * @openapi
 * /api/artworks:
 *   post:
 *     summary: Create a new artwork
 *     description: Mint a new AI-generated artwork (Requires Authentication)
 *     tags: [Artworks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateArtwork'
 *     responses:
 *       201:
 *         description: Artwork created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, validate(createArtworkSchema), artworkController.createArtwork)

/**
 * @openapi
 * /api/artworks/{id}:
 *   put:
 *     summary: Update an artwork
 *     description: Update metadata or price of an existing artwork (Requires Authentication)
 *     tags: [Artworks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateArtwork'
 *     responses:
 *       200:
 *         description: Artwork updated successfully
 */
router.put('/:id', authenticate, validate(updateArtworkSchema), artworkController.updateArtwork)

/**
 * @openapi
 * /api/artworks/{id}:
 *   delete:
 *     summary: Delete an artwork
 *     description: Remove an artwork from the marketplace (Requires Authentication)
 *     tags: [Artworks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Artwork deleted successfully
 */
router.delete('/:id', authenticate, validate(getArtworkSchema), artworkController.deleteArtwork)

export default router
