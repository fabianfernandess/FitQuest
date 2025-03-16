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
  if (!response.counters) {
    throw new Error("Missing counters object.");
  }
  return true;
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
  
  Respond in JSON format as trained. Do not include any extra characters or text outside of the JSON object. **Always include the "response" field in your response.**`;// Added instruction

  try {
    const response = await axios.post(
      API_URL,
      {
        model: "ft:gpt-4o-mini-2024-07-18:personal:fitquest-trainers:BBVsDPd5:ckpt-step-75",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userData.message },
        ],
        temperature: 0.6, // Reduced temperature
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

      // Attempt to extract JSON even without backticks
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
        youtubeLink: parsedResponse.youtubeLink || "",
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