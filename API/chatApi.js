import axios from 'axios';
import { OPENAI_API_KEY } from '@env';

const API_URL = 'https://api.openai.com/v1/chat/completions';

export const getFitnessResponse = async (userData) => {
    const systemPrompt = `You are an advanced AI fitness trainer facilitating personalized coaching sessions for the user ${userData.name}. ${userData.name} is part of the ${userData.house} and has the following fitness profile:

- **BMI:** ${userData.bmi}
- **Height:** ${userData.height} cm
- **Weight:** ${userData.weight} kg
- **Exercise Level:** ${userData.exerciseLevel}
- **Fitness Goals:** ${userData.selectedOptions.join(', ')}

Your role is to provide tailored fitness guidance based on the characteristics of ${userData.house}, ensuring your responses are motivational, clear, and engaging. Do not entertain or respond to any inquiries unrelated to fitness.

# Output Format

Always respond in **valid JSON format** with six key items:
- "response" (text-based guidance)
- "youtubeLink" (exercise video URL)
- "exerciseDetails" (reps, sets, and exercise names)
- "dailyTasks" (comprehensive list of daily tasks)
- "counters" (calorie, points, and task completion data)

Ensure your response **only contains valid JSON** without extra text.

## Example Response:
{
  "response": "To improve flexibility, start with dynamic stretches. Try doing leg swings, arm circles, and hip rotations for 5 minutes before workouts.",
  "youtubeLink": "https://www.youtube.com/watch?v=example",
  "exerciseDetails": [{"name": "Leg Swings", "sets": 3, "reps": 15}],
  "dailyTasks": ["Do 5 minutes of stretching in the morning", "Drink 2 liters of water"],
  "counters": {"calories": 1500, "points": 10, "tasksCompleted": 2}
}
`;

    try {
        const response = await axios.post(API_URL, {
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userData.message }
            ],
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Raw OpenAI Response:', response.data);
        
        if (
            response.data &&
            response.data.choices &&
            response.data.choices.length > 0 &&
            response.data.choices[0].message &&
            response.data.choices[0].message.content
        ) {
            const rawContent = response.data.choices[0].message.content.trim();
            try {
                if (!rawContent.startsWith('{') || !rawContent.endsWith('}')) {
                    throw new Error('Response is not a valid JSON object');
                }
                return JSON.parse(rawContent);
            } catch (error) {
                console.error("Error parsing JSON from OpenAI:", error, "\nRaw Content:", rawContent);
                return { response: "Sorry, I encountered an issue processing your request." };
            }
        } else {
            console.error("Invalid response structure from OpenAI:", response.data);
            return { response: "Sorry, I encountered an issue processing your request." };
        }
    } catch (error) {
        console.error('Error fetching fitness response:', error);
        return { response: 'Sorry, I encountered an issue processing your request. Please try again.' };
    }
};
