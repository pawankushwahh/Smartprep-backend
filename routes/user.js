const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const requireAuth = require('../middleware/auth');

// GET /user/progress
router.get('/progress', requireAuth, async (req, res) => {
  const userId = req.user.id;

  // Fetch topics saved for this user
  const { data: topics, error } = await supabase
    .from('topics')
    .select('name, exam_type, priority, time_estimate, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch progress' });
  }

  // Build progress map: subject -> count of topics recommended
  const progress = {};
  (topics || []).forEach(t => {
    const key = t.exam_type;
    if (!progress[key]) progress[key] = 0;
    progress[key]++;
  });

  res.json({
    progress,
    topics: topics || [],
    totalTopics: topics?.length || 0,
  });
});

// GET /user/profile
router.get('/profile', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('name, exam_type, target_date, created_at')
    .eq('id', req.user.id)
    .single();

  if (error) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  res.json({
    profile: {
      id: req.user.id,
      email: req.user.email,
      ...data,
    },
  });
});

// PATCH /user/profile — update profile
router.patch('/profile', requireAuth, async (req, res) => {
  const { name, examType, targetDate } = req.body;

  const updates = {};
  if (name) updates.name = name;
  if (examType) updates.exam_type = examType;
  if (targetDate) updates.target_date = targetDate;

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', req.user.id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: 'Failed to update profile' });
  }

  res.json({ profile: data });
});

// GET /user/topics — get saved topics for current user
router.get('/topics', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch topics' });
  }

  res.json({ topics: data || [] });
});

module.exports = router;
