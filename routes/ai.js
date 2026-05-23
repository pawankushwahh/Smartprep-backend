const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const requireAuth = require('../middleware/auth');
const supabase = require('../db/supabase');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// POST /ai/recommend
// Body: { examType: string, subjects: string[] }
router.post('/recommend', requireAuth, async (req, res) => {
  const { examType, subjects } = req.body;

  if (!examType || !subjects || !Array.isArray(subjects) || subjects.length === 0) {
    return res.status(400).json({ error: 'examType (string) and subjects (array) are required' });
  }

  const prompt = `
    You are an expert exam coach for ${examType}.
    The student wants to study: ${subjects.join(', ')}.
    List the 5 most important topics to study RIGHT NOW, prioritized by exam weightage.
    For each topic give: name, priority (high/medium/low), estimated study time, and a one-line tip.
    Respond ONLY in this exact JSON format with no extra text or markdown:
    { "topics": [{"name": "", "priority": "", "timeEst": "", "tip": ""}] }
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    // Optionally save topics to DB
    if (parsed.topics && Array.isArray(parsed.topics)) {
      const rows = parsed.topics.map(t => ({
        user_id: req.user.id,
        name: t.name,
        exam_type: examType,
        priority: t.priority,
        time_estimate: t.timeEst,
      }));
      await supabase.from('topics').insert(rows);
    }

    res.json(parsed);
  } catch (err) {
    console.error('AI recommend error:', err.message);
    res.status(500).json({ error: 'AI service error: ' + err.message });
  }
});

// POST /ai/notes
// Body: { topic: string }
router.post('/notes', requireAuth, async (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'topic is required' });
  }

  const prompt = `
    Write clear, concise study notes on the topic: "${topic}".
    Format as markdown with:
    - ## Headings for sections
    - Bullet points for key facts
    - **Bold** for important terms
    - A "Key Takeaways" section at the end
    Keep it under 400 words. Focus on exam-relevant points only.
  `;

  try {
    const result = await model.generateContent(prompt);
    const notes = result.response.text();
    res.json({ notes, topic });
  } catch (err) {
    console.error('AI notes error:', err.message);
    res.status(500).json({ error: 'AI service error: ' + err.message });
  }
});

// POST /ai/quiz
// Body: { topic: string, numQuestions: number }
router.post('/quiz', requireAuth, async (req, res) => {
  const { topic, numQuestions = 5 } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'topic is required' });
  }

  const prompt = `
    Create ${numQuestions} multiple-choice quiz questions on: "${topic}".
    Each question should have 4 options (A, B, C, D) and one correct answer.
    Respond ONLY in this exact JSON format with no extra text:
    {
      "quiz": [
        {
          "question": "",
          "options": {"A": "", "B": "", "C": "", "D": ""},
          "answer": "A",
          "explanation": ""
        }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const clean = text.replace(/```json|```/g, '').trim();
    res.json(JSON.parse(clean));
  } catch (err) {
    console.error('AI quiz error:', err.message);
    res.status(500).json({ error: 'AI service error: ' + err.message });
  }
});

module.exports = router;
