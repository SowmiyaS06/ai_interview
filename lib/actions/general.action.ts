"use server";

import { apiFetch } from "@/lib/api";

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    const response = await apiFetch("/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interviewId, userId, transcript, feedbackId }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  try {
    const response = await apiFetch(`/interviews/${id}`);
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.success || !data.interview) return null;

    // Ensure _id is mapped to id
    const interview = data.interview;
    return {
      ...interview,
      id: interview.id || interview._id,
    };
  } catch (error) {
    console.error("Error fetching interview:", error);
    return null;
  }
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId } = params;

  try {
    const response = await apiFetch(`/feedback/by-interview/${interviewId}`);
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.success || !data.feedback) return null;

    // Ensure _id is mapped to id
    const feedback = data.feedback;
    return {
      ...feedback,
      id: feedback.id || feedback._id,
    };
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return null;
  }
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { limit = 20 } = params;

  try {
    const response = await apiFetch(`/interviews/latest?limit=${limit}`);
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.success || !data.interviews) return null;

    // Ensure each interview has id mapped from _id
    return data.interviews.map((interview: any) => ({
      ...interview,
      id: interview.id || interview._id,
    }));
  } catch (error) {
    console.error("Error fetching latest interviews:", error);
    return null;
  }
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  try {
    const response = await apiFetch("/interviews/user");
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.success || !data.interviews) return null;

    // Ensure each interview has id mapped from _id
    return data.interviews.map((interview: any) => ({
      ...interview,
      id: interview.id || interview._id,
    }));
  } catch (error) {
    console.error("Error fetching user interviews:", error);
    return null;
  }
}
