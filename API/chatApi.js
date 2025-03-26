import axios from 'axios';
import { OPENAI_API_KEY } from '@env';

const API_URL = 'https://api.openai.com/v1/chat/completions';

const validateResponse = (response) => {
    if (!response || typeof response !== "object") {
        throw new Error("Invalid response object.");
    }
    if (!response.response) {
        throw new Error("Missing response text.");
    }
    // Improved YouTube link validation
    if (response.youtubeLink && typeof response.youtubeLink !== 'string')
    {
        throw new Error("YouTube link must be a string.");
    }
    if (response.youtubeLink && !response.youtubeLink.includes("youtube.com/watch?v=") && response.youtubeLink !== "null") {
        throw new Error("Invalid YouTube link.");
    }
    if (!response.exerciseDetails || !response.exerciseDetails.exercise) {
        throw new Error("Missing exercise details.");
    }
    if (!response.counters) {
        throw new Error("Missing counters object.");
    }
    return true;
};

const sanitizeURL = (url) => {
  if (!url) return "";
  try {
    new URL(url);
    return url;
  } catch (_) {
    return "";
  }
};

export const getFitnessResponse = async (userData) => {

const systemPrompt = `User Information:
- Name: ${userData.name}
- House: ${userData.house}
- BMI: ${userData.bmi}
- Height: ${userData.height} cm
- Weight: ${userData.weight} kg
- Exercise Level: ${userData.exerciseLevel}
- Goals: ${userData.selectedOptions.join(", ")}
- Targeted Calorie Intake: ${userData.targetedCalorieIntake}

**Instructions:**
-   **Strict JSON Formatting:** Always respond in JSON format. Do not include any extra characters or text outside of the JSON object.
-   **Required Fields:** Every response must contain "response", "youtubeLink", "exerciseDetails", "dailyTasks", and "counters".
-   **Exercise Details:** Provide only **one exercise** at a time, including **sets, reps, and a valid YouTube tutorial link**.
-   **Daily Task and Calorie Management:** Generate a full **daily task list** aligned with ${userData.name}'s fitness goals.  Each task should be an object with a "time", "emoji", and "title" property.  For example:
    -   \`dailyTasks: [
            { time: "8:00 AM", emoji: "🍳", title: "Log breakfast" },
            { time: "9:00 AM", emoji: "🏋️‍♂️", title: "Run 2KM" },
            { time: "11:00 AM", emoji: "💧", title: "Drink water" },
            // ... other tasks
        ]\`
    Include a relevant emoji and time of day for each task.  Ensure the time is in "HH:MM AM/PM" format.
-   **Calorie, Points, and Task Tracking:**
    -   Track calories based on meals logged.
    -   Update points for completing exercises and healthy meal choices.
    -   Display tasks completed vs. total tasks.
-   **Meal Verification:**
    -   **After completing required workouts or at intervals, prompt ${userData.name} to present their meal for verification.**
    -   If a meal is not provided, suggest options to meet their calorie target.
    -   Adjust calorie count based on logged meals.
-   **Motivational Engagement:**
    -   Keep responses engaging, personalized, and inspiring based on ${userData.name}'s house and fitness journey.
    -   Acknowledge progress and push for consistency.
-   **User Inquiry Handling:** Answer all user questions concisely and **only** within the scope of fitness, exercise, and health.

Follow these instructions strictly while ensuring a smooth, structured, and engaging experience for the user.
`;


    try {
        const response = await axios.post(
            API_URL,
            {
                model: "ft:gpt-4o-mini-2024-07-18:personal:fitquest-trainers2-0:BBidYosO",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userData.message },
                ],
                temperature: 0.8,
            },
            {
                headers: {
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (
            response.data &&
            response.data.choices &&
            response.data.choices.length > 0 &&
            response.data.choices[0].message &&
            response.data.choices[0].message.content
        ) {
            let rawContent = response.data.choices[0].message.content.trim();
            console.log('Raw OpenAI Response:', rawContent); // Log raw response

            let jsonString = rawContent;
            const jsonMatch = rawContent.match(/`json([\s\S]*?)`/);
            if (jsonMatch && jsonMatch[1]) {
                jsonString = jsonMatch[1].trim();
            }

            let parsedResponse;
            try {
                parsedResponse = JSON.parse(jsonString);
                validateResponse(parsedResponse);
            } catch (error) {
                console.error("Error parsing/validating response:", error);
                console.error("JSON String:", jsonString); // Log the string causing the error
                throw new Error("Invalid response from model.");
            }

            const sanitizedCounters = {
                calories: isNaN(Number(parsedResponse.counters.calories)) ? 0 : Number(parsedResponse.counters.calories),
                points: isNaN(Number(parsedResponse.counters.points)) ? 0 : Number(parsedResponse.counters.points),
                tasksCompleted: isNaN(Number(parsedResponse.counters.tasksCompleted)) ? 0 : Number(parsedResponse.counters.tasksCompleted),
            };

            return {
                response: parsedResponse.response,
                youtubeLink: parsedResponse.youtubeLink ? sanitizeURL(parsedResponse.youtubeLink) : "", // Sanitize the URL
                exerciseDetails: parsedResponse.exerciseDetails,
                dailyTasks: parsedResponse.dailyTasks,
                counters: sanitizedCounters,
            };
        } else {
            console.error("Unexpected OpenAI API response structure:", response.data);
            throw new Error("Unexpected API response.");
        }
    } catch (error) {
        console.error("Error fetching fitness response:", error);
        return {
            response: "Sorry, I encountered an issue processing your request. Please try again.",
            youtubeLink: "",
            exerciseDetails: {},
            dailyTasks: [],
            counters: { calories: 0, points: 0, tasksCompleted: 0 },
        };
    }
};

export default validateResponse;
