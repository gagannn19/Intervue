import { apiRequest } from "../lib/apiClient";

// GET /interview-types — the schedule wizard's Type step. Returns
// [{ id, slug, name, description, isActive, ... }]. The icon + "live"
// treatment is layered on in the frontend (see constants/interviewTypes.js).
export async function getInterviewTypes() {
  return apiRequest("/interview-types");
}
