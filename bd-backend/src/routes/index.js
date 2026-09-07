import { Router } from 'express'
import { getProjects } from '../services/github.js'
import imageProxy from './image-proxy.js'

const router = Router()

router.use('/image-proxy', imageProxy)

router.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

router.get('/projects/first', async (req, res) => {
  try {
    // Randomize which page we fetch the first project from to avoid always showing
    // the same repo on page reload. GitHub search is deterministic, so using random
    // batch/page numbers ensures variety even when cache expires.
    const randomBatch = Math.floor(Math.random() * 100) + 1
    const projects = await getProjects({ perPage: 1, light: true, batch: randomBatch })
    res.set('Cache-Control', 'public, max-age=60, s-maxage=120')
    res.json(projects)
  } catch (error) {
    res.status(502).json({ error: error.message })
  }
})

router.get('/projects', async (req, res) => {
  const { query, sort, per_page: perPage, refresh, light, topic, batch } = req.query
  try {
    const projects = await getProjects({
      refresh: refresh === '1' || refresh === 'true',
      query: query || undefined,
      sort: sort || undefined,
      perPage: perPage ? Number(perPage) : undefined,
      light: light === '1' || light === 'true',
      // Affinity topic the client's taste model wants the feed steered toward.
      topic: typeof topic === 'string' ? topic : undefined,
      batch: batch ? Number(batch) : undefined,
    })
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600')
    res.json(projects)
  } catch (error) {
    res.status(502).json({ error: error.message })
  }
})

export default router