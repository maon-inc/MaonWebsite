export interface WaitlistSubmission {
  email: string;
  name?: string;
}

export interface WaitlistResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function submitWaitlist(
  data: WaitlistSubmission
): Promise<WaitlistResponse> {
  try {
    const response = await fetch("/api/waitlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "Failed to submit to waitlist",
      };
    }

    return {
      success: true,
      message: result.message || "Successfully added to waitlist",
    };
  } catch (error) {
    console.error("Waitlist submission error:", error);
    return {
      success: false,
      error: "Network error. Please try again later.",
    };
  }
}


