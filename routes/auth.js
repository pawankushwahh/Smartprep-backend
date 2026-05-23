const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');

// POST /auth/signup
router.post('/signup', async (req, res) => {
  const { email, password, name, examType, targetDate } = req.body;

  if (!email || !password || !name || !examType) {
    return res.status(400).json({ error: 'email, password, name, and examType are required' });
  }

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) return res.status(400).json({ error: error.message });

  // Save extra profile info
  const { error: profileError } = await supabase.from('profiles').insert({
    id: data.user.id,
    name,
    exam_type: examType,
    target_date: targetDate || null,
  });

  if (profileError) {
    console.error('Profile insert error:', profileError.message);
  }

  res.status(201).json({
    token: data.session?.access_token || null,
    user: {
      id: data.user.id,
      email: data.user.email,
      name,
      examType,
    },
    message: 'Account created successfully. Check your email to confirm.',
  });
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return res.status(401).json({ error: 'Invalid credentials' });

  // Fetch profile info
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, exam_type, target_date')
    .eq('id', data.user.id)
    .single();

  res.json({
    token: data.session.access_token,
    user: {
      id: data.user.id,
      email: data.user.email,
      name: profile?.name,
      examType: profile?.exam_type,
      targetDate: profile?.target_date,
    },
  });
});

// POST /auth/logout
router.post('/logout', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) await supabase.auth.signOut();
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
