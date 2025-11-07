import axios from "axios";

const BASE_URL = "http://localhost:8000/api";

// ------------------------
// Error Parser
// ------------------------
const parseError = (error) => {
  if (!error.response) return { detail: "Network or server error" };

  const data = error.response.data;

  if (Array.isArray(data.detail)) {
    return { detail: data.detail.map(d => d.msg).join(", ") };
  }

  return data;
};

// ------------------------
// Auth APIs
// ------------------------
export const signupUser = async (username, password) => {
  try {
    const res = await axios.post(`${BASE_URL}/auth/signup`, { username: username.trim(), password });
    return res.data;
  } catch (error) {
    throw parseError(error);
  }
};

export const loginUser = async (username, password) => {
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, { username: username.trim(), password });
    return res.data;
  } catch (error) {
    throw parseError(error);
  }
};

// ------------------------
// Story APIs
// ------------------------
export const startStory = async ({ player_name, genres, mood }) => {
  try {
    const endpoint = player_name ? "story/start" : "story/ai-start";
    const payload = player_name ? { player_name } : { genres, mood };
    const res = await axios.post(`${BASE_URL}/${endpoint}`, payload);
    return res.data;
  } catch (error) {
    throw parseError(error);
  }
};

export const continueStory = async ({ story_id, choice_text, user_text }) => {
  try {
    const res = await axios.post(`${BASE_URL}/story/continue`, { story_id, choice_text, user_text });
    return res.data;
  } catch (error) {
    throw parseError(error);
  }
};

export const saveStory = async ({ user_id, story_id }) => {
  try {
    const res = await axios.post(`${BASE_URL}/story/save`, { user_id, story_id });
    return res.data;
  } catch (error) {
    throw parseError(error);
  }
};

// ------------------------
// History APIs
// ------------------------
export const getHistory = async (user_id) => {
  try {
    const res = await axios.get(`${BASE_URL}/story/history`, { params: { user_id } });
    return res.data;
  } catch (error) {
    throw parseError(error);
  }
};

export const getStoryById = async ({ user_id, story_id }) => {
  try {
    const res = await axios.get(`${BASE_URL}/story/get`, { params: { user_id, story_id } });
    return res.data;
  } catch (error) {
    throw parseError(error);
  }
};

export const deleteStory = async ({ user_id, story_id }) => {
  try {
    const res = await axios.delete(`${BASE_URL}/story/delete`, { data: { user_id, story_id } });
    return res.data;
  } catch (error) {
    throw parseError(error);
  }
};
