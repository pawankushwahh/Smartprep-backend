const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const requireAuth = require('../middleware/auth');

// GET /resources/:topic
router.get('/:topic', requireAuth, async (req, res) => {
  const { topic } = req.params;

  const { data, error } = await supabase
    .from('resources')
    .select('id, title, url, source, topic')
    .ilike('topic', `%${topic}%`)
    .order('id', { ascending: true });

  if (error) {
    console.error('Resources fetch error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch resources' });
  }

  res.json({ resources: data || [] });
});

// GET /resources  — get all resources (paginated)
router.get('/', requireAuth, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const from = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('resources')
    .select('*', { count: 'exact' })
    .range(from, from + limit - 1);

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch resources' });
  }

  res.json({
    resources: data || [],
    total: count,
    page,
    totalPages: Math.ceil(count / limit),
  });
});

// POST /resources  — add a resource (admin use)
router.post('/', requireAuth, async (req, res) => {
  const { topic, title, url, source } = req.body;

  if (!topic || !title || !url) {
    return res.status(400).json({ error: 'topic, title, and url are required' });
  }

  const { data, error } = await supabase
    .from('resources')
    .insert({ topic, title, url, source })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: 'Failed to add resource' });
  }

  res.status(201).json({ resource: data });
});

module.exports = router;
