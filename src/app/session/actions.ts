"use server"

const DAILY_API_KEY = process.env.DAILY_API_KEY;

export async function createDailyRoom() {
  // Demo Mode: If no API key, return a generic demo room or error
  if (!DAILY_API_KEY) {
    console.warn("DAILY_API_KEY missing. Returning mock room for testing.");
    // In a real hackathon without keys, we can't create dynamic rooms.
    // But we can fallback to a public demo room or a hardcoded one if the user provides it.
    // For now, I'll return an error instructing the user to add the key, or a mock object.
    // BETTER: Return a mock token that fails gracefully or logic to handle "Demo Mode".
    // Actually daily-js needs a real room URL. 
    // I will return a specific error flag.
    return {
      error: "Missing Daily Config",
      demoMode: true,
      url: "https://demo.daily.co/test_room" // Placeholder
    };
  }

  try {
    const exp = Math.round(Date.now() / 1000) + 60 * 60; // 1 hour expiration
    const options = {
      properties: {
        exp: exp,
      },
    };

    const response = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DAILY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options),
    });

    const room = await response.json();
    return { url: room.url, name: room.name };
  } catch (error) {
    console.error("Error creating room:", error);
    return { error: "Failed to create room" };
  }
}
