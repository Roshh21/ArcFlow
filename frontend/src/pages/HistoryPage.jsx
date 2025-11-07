import React, { useEffect, useState } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

const HistoryPage = ({ setCurrentPage, currentUserId, openStoryCallback }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get("/story/history", {
        params: { user_id: currentUserId },
      });
      setHistory(res.data.history || []);
    } catch (err) {
      console.error("Failed to fetch history:", err.response?.data || err.message);
    }
    setLoading(false);
  };

  const openStory = async (storyId) => {
    try {
      const res = await api.get("/story/get", {
        params: { user_id: currentUserId, story_id: storyId },
      });
      // Pass the story data back to StoryPage or handle here
      openStoryCallback(res.data);
      setCurrentPage("story");
    } catch (err) {
      console.error("Open story error:", err.response?.data || err.message);
      alert("Failed to open story.");
    }
  };

  const deleteStory = async (storyId) => {
    if (!window.confirm("Are you sure you want to delete this story?")) return;

    try {
      await api.delete("/story/delete", {
        data: { user_id: currentUserId, story_id: storyId },
      });
      alert("Story deleted successfully!");
      fetchHistory(); // Refresh history
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
      alert("Could not delete the story.");
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-6">Your Story History</h1>
      {loading && <p className="text-gray-400">Loading...</p>}
      {!loading && history.length === 0 && <p className="text-gray-400">No saved stories yet.</p>}
      <div className="space-y-4">
        {history.map((story) => (
          <div
            key={story.story_id}
            className="bg-gray-800 p-4 rounded-lg shadow-md flex justify-between items-start"
          >
            <div>
              <h2 className="text-xl font-semibold">{story.title || "Untitled Story"}</h2>
              {story.genre && story.mood && (
                <p className="text-gray-400 text-sm">
                  Genre: {story.genre} | Mood: {story.mood}
                </p>
              )}
              {story.last_played && (
                <p className="text-gray-400 text-sm">
                  Last played: {new Date(story.last_played).toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => openStory(story.story_id)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Open
              </button>
              <button
                onClick={() => deleteStory(story.story_id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setCurrentPage("home")}
        className="mt-6 underline text-sm text-purple-400 hover:text-purple-600"
      >
        Back to Home
      </button>
    </div>
  );
};

export default HistoryPage;