import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true
});

// GET contest details
export const getContestById = (contestId) =>
  API.get(`/contests/${contestId}`);

// JOIN contest
export const joinContest = (contestId) =>
  API.post(`/contests/${contestId}/join`);

// GET leaderboard
export const getLeaderboard = (contestId) =>
  API.get(`/contests/${contestId}/leaderboard`);