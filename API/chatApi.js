import axios from 'axios';
import { OPENAI_API_KEY } from '@env';

const API_URL = 'https://api.openai.com/v1/chat/completions';

// Required keys for the OpenAI response (youtubeLink is optional)
const REQUIRED_KEYS = ["response", "exerciseDetails", "dailyTasks", "counters"];

/**
 * Validates the structure and types of the OpenAI response.
 * @param {object} response - The response object from OpenAI.
 * @throws {Error} If the response is invalid.
 */
const validateResponse = (response) => {
  console.log("Validating response:", JSON.stringify(response, null, 2));

  // Check for missing required keys
  const missingKeys = REQUIRED_KEYS.filter((key) => !(key in response));
  if (missingKeys.length > 0) {
    throw new Error(`Missing required keys: ${missingKeys.join(", ")}`);
  }

  // Validate counters object
  if (typeof response.counters !== "object") {
    throw new Error("counters must be an object.");
  }
  if (
    isNaN(Number(response.counters.calories)) ||
    isNaN(Number(response.counters.points)) ||
    isNaN(Number(response.counters.tasksCompleted))
  ) {
    throw new Error("Invalid counters object. All values must be numbers.");
  }

  // Validate dailyTasks array
  if (!Array.isArray(response.dailyTasks)) {
    throw new Error("dailyTasks must be an array.");
  }

  // Validate exerciseDetails
  if (response.exerciseDetails === undefined || response.exerciseDetails === null) {
    throw new Error("exerciseDetails cannot be undefined or null.");
  }

  // Handle cases where exerciseDetails is an array or a single object
  if (Array.isArray(response.exerciseDetails)) {
    console.log("exerciseDetails IS AN ARRAY:", response.exerciseDetails); // Confirm array detection
    if (response.exerciseDetails.length === 0) {
      throw new Error("exerciseDetails array cannot be empty if it is an array."); // Optional: disallow empty arrays
    }
    response.exerciseDetails.forEach((exercise, index) => {
      console.log(`--- Validating exerciseDetails item at index ${index} ---`);
      console.log(`Exercise object:`, exercise); // Log the entire exercise object
      console.log(`Exercise Name:`, exercise.name); // Log exercise.name
      console.log(`Exercise Reps (before check):`, exercise.reps); // Log exercise.reps *before* type check
      console.log(`Type of Exercise Reps (before check):`, typeof exercise.reps); // Log type of exercise.reps *before* type check

      if (typeof exercise !== "object") {
        throw new Error(`exerciseDetails[${index}] must be an object.`);
      }
      if (typeof exercise.name !== "string") {
        throw new Error(`name in exerciseDetails[${index}] must be a string.`);
      }
      if (typeof exercise.sets !== "number") {
        throw new Error(`sets in exerciseDetails[${index}] must be a number.`);
      }
      // Validate reps for each exercise in the array
      if (
        exercise.reps === undefined ||
        exercise.reps === null ||
        (typeof exercise.reps !== "number" && typeof exercise.reps !== "string")
      ) {
        throw new Error(`reps in exerciseDetails[${index}] must be a number or a string.`);
      }
      console.log(`Validation successful for exerciseDetails item at index ${index}.`); // Debugging log for array items
      console.log(`--- Validation END for exerciseDetails item at index ${index} ---`);
    });
  } else if (typeof response.exerciseDetails === "object") {
    // Validation for single exerciseDetails object (your original validation)
    console.log("Validating single exerciseDetails object:", response.exerciseDetails); // Debugging log for single object
    if (typeof response.exerciseDetails.name !== "string") {
      throw new Error("name in exerciseDetails must be a string.");
    }
    if (typeof response.exerciseDetails.sets !== "number") {
      throw new Error("sets in exerciseDetails must be a number.");
    }
    // Validate reps for single exerciseDetails object
    console.log("Type of response.exerciseDetails.reps:", typeof response.exerciseDetails.reps);
    console.log("Value of response.exerciseDetails.reps:", response.exerciseDetails.reps);
    if (
      response.exerciseDetails.reps === undefined ||
      response.exerciseDetails.reps === null ||
      (typeof response.exerciseDetails.reps !== "number" && typeof response.exerciseDetails.reps !== "string")
    ) {
      throw new Error("reps in exerciseDetails must be a number or a string.");
    }
    console.log("Validation successful for single exerciseDetails object."); // Debugging log for single object
  } else {
    throw new Error("exerciseDetails must be an object or an array of objects.");
  }


  // Validate youtubeLink (optional)
  if (response.youtubeLink && typeof response.youtubeLink !== "string") {
    throw new Error("youtubeLink must be a string.");
  }

  // Validate response string
  if (typeof response.response !== "string") {
    throw new Error("response must be a string.");
  }

  console.log("Response validation successful.");
  return true;
};

export default validateResponse;
/**
 * Fetches a fitness response from OpenAI based on user data.
 * @param {object} userData - User information and message.
 * @returns {object} - Sanitized response from OpenAI.
 */
export const getFitnessResponse = async (userData) => {
  // Trainer personalities based on the user's house
  const trainerPersonalities = {
    Valor: "Maximus is your dedicated trainer—strong-willed and relentless. He believes in discipline, pushing your limits, and forging resilience through intense workouts.",
    Lumina: "Serene is your guiding force—calm, wise, and strategic. She promotes endurance, balance, and sustainable habits, ensuring your long-term fitness success.",
    Nova: "Lyra is your high-energy trainer—dynamic, creative, and always keeping things fresh. She thrives on fast-paced, high-intensity workouts that challenge and excite.",
  };

  // System prompt for OpenAI
  const systemPrompt = `You are an AI fitness coach guiding ${userData.name}, a member of ${userData.house}. Your coaching style aligns with their house trainer:

- **Trainer Personality:** ${trainerPersonalities[userData.house]}
- **BMI:** ${userData.bmi}, **Height:** ${userData.height} cm, **Weight:** ${userData.weight} kg
- **Exercise Level:** ${userData.exerciseLevel}
- **Goals:** ${userData.selectedOptions.join(", ")}

**Instructions:**
- Reply in structured JSON with:
  - response (fitness advice)
  - youtubeLink (video demo URL, only if providing a workout tutorial)
  - **exerciseDetails**: This can be either:
    - **A single object** for one exercise: \`{ "name": "Exercise Name", "sets": number, "reps": number | string }\`
    - **An array of objects** for multiple exercises: \`[ { "name": "Exercise 1 Name", "sets": number, "reps": number | string }, { "name": "Exercise 2 Name", "sets": number, "reps": number | string }, ... ]\`
  - dailyTasks (list of fitness tasks)
  - counters (calories, points, completed tasks)
- Tailor responses to match the user's house traits and fitness level.
- Provide **practical exercises, meal tips, and motivation**.
- Ensure responses are **clear, direct, and actionable**.

**The sets, reps, calories, points, and tasksCompleted should strictly be integers ONLY.**
** Each response should only have one exercise or task at a time**

**Example Response Format (Single Exercise):**
\`\`\`json
{
  "response": "Here's a beginner-friendly workout plan to help you build muscle. Start with 3 sets of 12 reps for each exercise.",
  "youtubeLink": "https://www.youtube.com/watch?v=d3LPrhI0v-w",
  "exerciseDetails": {
    "name": "Push-ups",
    "sets": 3,
    "reps": 12
  },
  "dailyTasks": [
    "Do 3 sets of push-ups",
    "Drink 2 liters of water",
    "Eat a protein-rich meal"
  ],
  "counters": {
    "calories": 250,
    "points": 10,
    "tasksCompleted": 0
  }
}
\`\`\`

**Example Response Format (Multiple Exercises - Array):**
\`\`\`json
{
  "response": "Here are a couple of exercises to work different muscle groups.",
  "exerciseDetails": [
    {
      "name": "Squats",
      "sets": 3,
      "reps": 15
    },
    {
      "name": "Plank",
      "sets": 3,
      "reps": "30 seconds"
    }
  ],
  "dailyTasks": [
    "Perform squats as instructed",
    "Hold plank for 30 seconds, 3 sets",
    "Drink water throughout the day"
  ],
  "counters": {
    "calories": 200,
    "points": 15,
    "tasksCompleted": 0
  }
}
\`\`\`

Respond **only in JSON** format.`;

  try {
    // Send request to OpenAI
    const response = await axios.post(
      API_URL,
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userData.message },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Raw OpenAI Response:", JSON.stringify(response.data, null, 2));

    // Extract and validate the response
    if (
      response.data &&
      response.data.choices &&
      response.data.choices.length > 0 &&
      response.data.choices[0].message &&
      response.data.choices[0].message.content
    ) {
      let rawContent = response.data.choices[0].message.content.trim();

      // Extract JSON from code block (if present)
      const jsonMatch = rawContent.match(/`json([\s\S]*?)`/);
      if (jsonMatch && jsonMatch[1]) {
        rawContent = jsonMatch[1].trim();
      }

      let parsedResponse;
      try {
        // Parse the JSON response
        parsedResponse = JSON.parse(rawContent);
      } catch (jsonError) {
        console.error("Error parsing OpenAI JSON response:", jsonError);
        throw new Error("Invalid JSON response from OpenAI.");
      }

      // Validate the parsed response
      try {
        validateResponse(parsedResponse);
      } catch (validationError) {
        console.error("Invalid response structure from OpenAI:", validationError.message);
        throw new Error(validationError.message);
      }

      // Sanitize counters to ensure all values are numbers
      const sanitizedCounters = {
        calories: isNaN(Number(parsedResponse.counters.calories)) ? 0 : Number(parsedResponse.counters.calories),
        points: isNaN(Number(parsedResponse.counters.points)) ? 0 : Number(parsedResponse.counters.points),
        tasksCompleted: isNaN(Number(parsedResponse.counters.tasksCompleted)) ? 0 : Number(parsedResponse.counters.tasksCompleted),
      };

      // Return the sanitized response
      return {
        response: parsedResponse.response,
        youtubeLink: parsedResponse.youtubeLink || "", // Handle missing youtubeLink
        exerciseDetails: parsedResponse.exerciseDetails,
        dailyTasks: parsedResponse.dailyTasks,
        counters: sanitizedCounters,
      };
    }
  } catch (error) {
    console.error("Error fetching fitness response:", error);
    // Return a fallback response in case of errors
    return {
      response: "Sorry, I encountered an issue processing your request. Please try again.",
      youtubeLink: "",
      exerciseDetails: {},
      dailyTasks: [],
      counters: { calories: 0, points: 0, tasksCompleted: 0 },
    };
  }
};