import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
});

const StoryPage = ({ setCurrentPage, mode = 'user', userId }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedMood, setSelectedMood] = useState('');
  const [story, setStory] = useState([]);
  const [choices, setChoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiStep, setAiStep] = useState(1); // 1 = genre, 2 = mood, 3 = story
  const [storyId, setStoryId] = useState(null);

  const scrollRef = useRef();

  // Dark theme styling
  const bgColor = 'bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-900';
  const cardBg = 'bg-zinc-800/80 backdrop-blur-sm border border-zinc-700 rounded-2xl shadow-xl';
  const textPrimary = 'text-white';
  const textSecondary = 'text-zinc-400';
  const buttonBase = 'px-6 py-3 rounded-xl font-semibold text-white transition-colors duration-300';

  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [story, choices]);

  // ---------- START STORY ----------
  const startStory = async () => {
    if ((mode === 'user' && !prompt) || (mode === 'ai' && (!selectedGenres.length || !selectedMood))) return;
    setLoading(true);

    try {
      const endpoint = mode === 'user' ? '/story/start' : '/story/ai-start';
      const payload =
        mode === 'user'
          ? { player_name: prompt, user_id: userId }
          : { genres: selectedGenres, mood: selectedMood, user_id: userId };

      const res = await api.post(endpoint, payload);

      const chapterText = res.data.chapter?.text || res.data.message;
      setStory([chapterText]);

      const aiChoices = res.data.choices || res.data.chapter?.choices || [];
      setChoices(
        aiChoices.map((c, i) => ({
          label: `Option ${String.fromCharCode(65 + i)}`,
          text: c.text || c,
        }))
      );

      setStoryId(res.data.story_id || null);
      setAiStep(3); // Move to story display
    } catch (err) {
      console.error('Story start error:', err.response?.data || err.message);
      alert('Failed to start story.');
    }

    setLoading(false);
  };

  // ---------- CONTINUE STORY ----------
  const continueStory = async (choiceText = null) => {
    if (!choiceText) return;
    setLoading(true);

    try {
      const res = await api.post('/story/continue', {
        user_id: userId,
        story_id: storyId,
        choice_text: choiceText,
      });

      const chapterText = res.data.chapter?.text || '';
      setStory(prev => [...prev, chapterText]);

      const aiChoices = res.data.choices || res.data.chapter?.choices || [];
      setChoices(
        aiChoices.map((c, i) => ({
          label: `Option ${String.fromCharCode(65 + i)}`,
          text: c.text || c,
        }))
      );
    } catch (err) {
      console.error('Story continue error:', err.response?.data || err.message);
      alert('Failed to continue story.');
    }

    setLoading(false);
  };

  // ---------- SAVE STORY ----------
  const saveStory = async () => {
    if (!storyId) return;

    try {
      await api.post('/story/save', { user_id: userId, story_id: storyId });
      alert('Story saved to your history!');
    } catch (err) {
      console.error('Save story error:', err.response?.data || err.message);
      alert('Failed to save story.');
    }
  };

  const pauseStory = () => alert('Story paused. You can resume later.');

  // ---------- GENRE TOGGLE ----------
  const toggleGenre = (g) => {
    setSelectedGenres(prev =>
      prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]
    );
  };

  return (
    <div className={`flex flex-col items-center min-h-screen p-8 transition-colors duration-500 ${bgColor}`}>
      <div className="w-full max-w-4xl space-y-6">
        {/* USER MODE */}
        {story.length === 0 && mode === 'user' && (
          <div className={`p-6 ${cardBg}`}>
            <h2 className={`text-2xl font-bold mb-4 ${textPrimary}`}>Your Prompt</h2>
            <textarea
              className={`w-full h-32 p-3 border rounded-md ${cardBg} border-zinc-600 ${textPrimary}`}
              placeholder="E.g., A lonely knight travels into a haunted forest."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
            />
            <button
              onClick={startStory}
              disabled={loading}
              className={`${buttonBase} bg-purple-600 hover:bg-purple-700 mt-4 w-full`}
            >
              {loading ? 'Generating...' : 'Begin Story'}
            </button>
          </div>
        )}

        {/* AI MODE */}
        {mode === 'ai' && story.length === 0 && (
          <>
            {aiStep === 1 && (
              <div className={`p-6 ${cardBg}`}>
                <h2 className={`text-2xl font-bold mb-4 ${textPrimary}`}>Select Genres</h2>
                <div className="flex flex-wrap gap-2">
                  {['Fantasy', 'Horror', 'Sci-Fi', 'Romance', 'Mystery'].map(g => (
                    <button
                      key={g}
                      onClick={() => toggleGenre(g)}
                      className={`px-4 py-2 rounded-xl font-semibold ${
                        selectedGenres.includes(g)
                          ? 'bg-purple-600 text-white'
                          : 'bg-zinc-700 text-zinc-300 hover:bg-purple-500'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setAiStep(2)}
                  disabled={selectedGenres.length === 0}
                  className={`${buttonBase} bg-purple-600 hover:bg-purple-700 mt-4 w-full`}
                >
                  Next: Select Mood
                </button>
              </div>
            )}

            {aiStep === 2 && (
              <div className={`p-6 ${cardBg}`}>
                <h2 className={`text-2xl font-bold mb-4 ${textPrimary}`}>Select Mood</h2>
                <div className="flex flex-wrap gap-2">
                  {['Happy', 'Dark', 'Mysterious', 'Sad', 'Exciting'].map(m => (
                    <button
                      key={m}
                      onClick={() => setSelectedMood(m)}
                      className={`px-4 py-2 rounded-xl font-semibold ${
                        selectedMood === m
                          ? 'bg-purple-600 text-white'
                          : 'bg-zinc-700 text-zinc-300 hover:bg-purple-500'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <button
                  onClick={startStory}
                  disabled={!selectedMood || loading}
                  className={`${buttonBase} bg-purple-600 hover:bg-purple-700 mt-4 w-full`}
                >
                  {loading ? 'Generating...' : 'Start Story'}
                </button>
              </div>
            )}
          </>
        )}

        {/* STORY DISPLAY */}
        {story.length > 0 && (
          <div className={`p-6 space-y-4 ${cardBg}`}>
            {story.map((chapter, idx) => (
              <p key={idx} className={`${textSecondary} whitespace-pre-wrap`}>
                {chapter}
              </p>
            ))}
            <div ref={scrollRef}></div>

            {choices.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {choices.map(c => (
                  <button
                    key={c.label}
                    onClick={() => continueStory(c.text)}
                    className="p-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600"
                  >
                    {c.label}: {c.text}
                  </button>
                ))}
              </div>
            )}

            <div className="flex space-x-2 mt-2">
              <button
                onClick={saveStory}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
              >
                Save
              </button>
              <button
                onClick={pauseStory}
                className="px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600"
              >
                Pause
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setCurrentPage('home')}
          className="mt-4 underline text-sm text-purple-400 hover:text-purple-600"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default StoryPage;