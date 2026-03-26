import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

import { errorHandler } from '@/middleware/errorHandler'
import { notFound } from '@/middleware/notFound'
import cacheService from '@/services/cacheService'
import { createLogger } from '@/utils/logger'
import healthService from '@/services/healthService'
import databaseService from '@/services/databaseService'
import artworkRoutes from '@/routes/artwork'
import userRoutes from '@/routes/user'
import aiRoutes from '@/routes/ai'
import metadataRoutes from '@/routes/metadata'
import cacheRoutes from '@/routes/cache'
import imageOptimizerRoutes from '@/routes/imageOptimizer'

dotenv.config()

const logger = createLogger('Server')

const app = express()
const PORT = process.env.PORT || 5000

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
})

app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(compression())
app.use(morgan('combined'))
app.use(limiter)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Comprehensive health check endpoint
app.get('/health', async (req, res) => {
  try {
    const health = await healthService.getHealthCheck()
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503
    res.status(statusCode).json(health)
  } catch (error) {
    logger.error('Health check failed:', error)
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'muse-backend',
      error: 'Health check service unavailable'
    })
  }
})

// Readiness check (for Kubernetes/container orchestration)
app.get('/ready', async (req, res) => {
  try {
    const readiness = await healthService.getReadinessCheck()
    const statusCode = readiness.ready ? 200 : 503
    res.status(statusCode).json({
      ready: readiness.ready,
      timestamp: new Date().toISOString(),
      checks: readiness.checks
    })
  } catch (error) {
    logger.error('Readiness check failed:', error)
    res.status(503).json({
      ready: false,
      timestamp: new Date().toISOString(),
      error: 'Readiness check service unavailable'
    })
  }
})

// Liveness check (for Kubernetes/container orchestration)
app.get('/live', async (req, res) => {
  try {
    const liveness = await healthService.getLivenessCheck()
    res.status(200).json(liveness)
  } catch (error) {
    logger.error('Liveness check failed:', error)
    res.status(503).json({
      alive: false,
      timestamp: new Date().toISOString(),
      error: 'Liveness check service unavailable'
    })
  }
})

// Simple health check for backward compatibility
app.get('/health/simple', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'muse-backend',
  })
})

app.use('/api/artworks', artworkRoutes)
app.use('/api/users', userRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/metadata', metadataRoutes)
app.use('/api/cache', cacheRoutes)
app.use('/api', imageOptimizerRoutes)

app.use(notFound)
app.use(errorHandler)

app.listen(PORT, async () => {
  try {
    // Initialize database connection
    await databaseService.connect()
    
    logger.info(`🚀 Muse Backend API running on port ${PORT}`)
    logger.info(`📊 Health check: http://localhost:${PORT}/health`)
    logger.info(`🔧 Readiness check: http://localhost:${PORT}/ready`)
    logger.info(`💓 Liveness check: http://localhost:${PORT}/live`)
    logger.info(`🗄️ Cache stats: ${JSON.stringify(cacheService.getCacheStats())}`)
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully')
  await cacheService.disconnect()
  await databaseService.disconnect()
  process.exit(0)
})

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully')
  await cacheService.disconnect()
  await databaseService.disconnect()
  process.exit(0)
})

export default app
