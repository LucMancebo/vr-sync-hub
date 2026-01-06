import { Router } from 'express';

const router = Router();

// API Routes
router.get('/status', (req, res) => {
  res.json({
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

router.get('/videos', (req, res) => {
  // TODO: Implement video list endpoint
  res.json({ videos: [] });
});

router.post('/videos', (req, res) => {
  // TODO: Implement video upload endpoint
  res.json({ message: 'Video upload endpoint' });
});

export { router as appRouter };
