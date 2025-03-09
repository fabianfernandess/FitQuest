import { OPENAI_API_KEY } from '@env'; // Add your OpenAI API key in the environment variables
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

/**
 * Sends a message to ChatGPT and returns the structured response.
 * @param {string} userMessage - The user's input message.
 * @param {object} userInfo - The user's fitness profile and house information.
 * @returns {object} - The structured response from ChatGPT.
 */
export const sendMessageToChatGPT = async (userMessage, userInfo) => {
  const {
    name,
    house,
    bmi,
    height,
    weight,
    exerciseLevel,
    selectedOptions,
    justification,
    recommended_calories_per_day,
    target_bmi,
  } = userInfo;

  // Construct the enhanced system prompt
  const systemPrompt = `
    You are an advanced AI fitness trainer facilitating personalized coaching sessions for the user ${name}. ${name} is part of the ${house} and has the following fitness profile:

    - **BMI:** ${bmi}
    - **Height:** ${height} cm
    - **Weight:** ${weight} kg
    - **Exercise Level:** ${exerciseLevel}
    - **Fitness Goals:** ${selectedOptions.join(', ')}
    - **Justification for House Selection:** ${justification}
    - **Recommended Daily Calories:** ${recommended_calories_per_day} kcal
    - **Target BMI:** ${target_bmi}

    Your role is to provide tailored fitness guidance based on the characteristics of ${house}, ensuring your responses are motivational, clear, and engaging. Do not entertain or respond to any inquiries unrelated to fitness.

    # Key Responsibilities

    - **Warm Greeting and BMI Overview:** Begin each session with a personalized greeting, introducing yourself in alignment with your house traits and offering a brief support-oriented BMI assessment.
    - **Exercise Demonstration:** Explain each exercise with clarity, showing demo videos and guiding ${name} through their fitness journey. Specify reps and sets for each exercise and include the name of the exercise. Provide a YouTube link to the exercise video as a separate object.
    - **Daily Task and Calorie Management:** Create a comprehensive list of tasks for the entire day, ensuring they align with ${name}'s fitness goals and are suitable for adding under a calendar. Ensure the daily calorie intake aligns with the recommended ${recommended_calories_per_day} kcal.
    - **Calorie, Points, and Task Completion Counter:** Track the daily caloric intake, points earned, and completed tasks by ${name}. Ensure the calorie counter reflects input from food consumed by ${name}. Award points for exercise completion, making healthy food choices, and completing daily tasks.
    - **User Inquiry Response:** Address any questions from ${name} with clear, concise answers focused solely on discussed exercises or fitness-related topics.
    - **Meal Verification:** Post-workout, encourage ${name} to verify their meals with a photo, offering feedback on nutritional content and updating the calorie counter.
    - **Motivational Engagement:** Regularly update ${name} on their progress, keeping the conversation lively and inspirational, tailored to their performance.

    # Output Format

    Provide responses in JSON format with six key items: "response" for text-based guidance, "youtubeLink" for the exercise video, "exerciseDetails" for the specified reps, sets, and exercise names, "dailyTasks" for the comprehensive list of daily tasks, "counters" for calorie, points, and task completion information.
  `;

  try {
    // Send the message to ChatGPT
    const completion = await openai.chat.completions.create({
      model: 'gpt-4', // Use GPT-4 or GPT-3.5-turbo
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' }, // Ensure the response is in JSON format
    });

    // Parse the response
    const responseText = completion.choices[0].message.content;
    const response = JSON.parse(responseText);

    return response;
  } catch (error) {
    console.error('Error communicating with ChatGPT:', error);
    throw new Error('Failed to get a response from ChatGPT. Please try again.');
  }
};