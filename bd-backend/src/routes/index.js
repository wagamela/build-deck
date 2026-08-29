import { Router } from 'express'
import { getProjects } from '../services/github.js'

const router = Router()

router.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

router.get('/projects', async (req, res) => {
  const { query, sort, per_page: perPage, refresh } = req.query
  try {
    const projects = await getProjects({
      refresh: refresh === '1' || refresh === 'true',
      query: query || undefined,
      sort: sort || undefined,
      perPage: perPage ? Number(perPage) : undefined,
    })
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600')
    res.json(projects)
  } catch (error) {
    res.status(502).json({ error: error.message })
  }
})

export default router