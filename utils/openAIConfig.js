import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getFitnessClassification(userData) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an advanced AI fitness classifier responsible for assigning users to one of three fitness houses based on their fitness profile, goals, and preferences. Additionally, you will calculate a target BMI level and suggest a daily calorie intake based on the user's details.

### 🏠 Houses & Their Core Principles:
- **House of Valor (Trainer: Maximus)**  
  - Strength, endurance, and resilience.  
  - Ideal for weightlifting, outdoor activities, and team sports.  
  - Best for disciplined individuals who push their limits.  

- **House of Elara (Trainer: Serene)**  
  - Flexibility, mindfulness, and holistic well-being.  
  - Ideal for yoga, stretching, and home workouts.  
  - Suited for stress relief, mental clarity, and body balance.  

- **House of Nova (Trainer: Lyra)**  
  - Agility, HIIT, and innovative training methods.  
  - Best for fast-paced workouts, tracking progress, and structured plans.  
  - Ideal for those who seek measurable improvements.  

### 📊 **Classification Criteria**
- Users interested in **weightlifting, outdoor activities, and team sports** → House of Valor.  
- Users who prefer **yoga, flexibility, home workouts, and mindfulness** → House of Elara.  
- Users who focus on **HIIT, tracking progress, and structured plans** → House of Nova.  
- If a user has mixed preferences, prioritize based on their strongest match, considering both exercise level and fitness goals.  

### 🔢 **Target BMI Calculation**
- Healthy BMI range: **18.5 - 24.9**  
- If BMI is **below 18.5**, target BMI = **19-21** (suggest weight gain).  
- If BMI is **above 25**, target BMI = **22-24** (suggest weight loss).  
- If BMI is **within 18.5 - 24.9**, suggest maintaining current BMI.  

### 🔥 **Calorie Intake Calculation**
**Mifflin-St Jeor Equation** for Basal Metabolic Rate (BMR):  
\`\`\`
BMR = (10 × weight in kg) + (6.25 × height in cm) − (5 × age) + 5
\`\`\`
Multiply by activity level:  
- **Sedentary:** BMR × 1.2  
- **Lightly Active:** BMR × 1.375  
- **Moderately Active:** BMR × 1.55  
- **Very Active:** BMR × 1.725  

**Adjust based on fitness goals:**  
- **Weight Loss:** Reduce intake by **500 kcal/day**  
- **Muscle Gain:** Increase intake by **300-500 kcal/day**  
- **Maintenance:** Keep recommended intake.  

### 📌 **Response Format**
Return the classification result in **valid JSON format only**, with no extra text:
\`\`\`
{
  "house": "House of Nova",
  "trainer": "Lyra",
  "justification": "User prefers structured plans, fast-paced workouts, and tracking progress. Their exercise level is moderately active, aligning well with Nova’s agility-focused approach.",
  "target_bmi": 22,
  "recommended_calories_per_day": 2200
}
\`\`\`
**Do not return any explanations or markdown. Respond with pure JSON only.`
        },
        {
          role: "user",
          content: JSON.stringify({
            name: userData.name,
            email: userData.email,
            height: userData.height,
            weight: userData.weight,
            bmi: userData.bmi,
            age: userData.age, // Ensure age is included for calorie calculation
            exercise_level: userData.exerciseLevel,
            preferences: userData.preferences,
          }),
        },
      ],
      temperature: 1,
      max_tokens: 1024,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const aiResponse = response.choices[0].message.content.trim();

    // Remove potential Markdown formatting
    const cleanedResponse = aiResponse.replace(/^```json\n/, "").replace(/\n```$/, "");

    console.log("✅ Cleaned OpenAI Response:", cleanedResponse);

    // Validate JSON response
    const jsonResponse = JSON.parse(cleanedResponse);

    if (!jsonResponse.house || !jsonResponse.trainer || !jsonResponse.target_bmi || !jsonResponse.recommended_calories_per_day) {
      throw new Error("⚠️ Incomplete response from AI.");
    }

    return jsonResponse;

  } catch (error) {
    console.error("❌ Error fetching fitness classification:", error);
    return null;
  }
}

// Example Usage
const userData = {
  name: "John Doe",
  email: "johndoe@example.com",
  height: 175,
  weight: 80,
  bmi: 26.1,
  age: 28,
  exerciseLevel: "Moderately Active",
  preferences: ["Loves weightlifting", "Likes tracking progress", "Enjoys HIIT workouts", "Has limited time for workouts"],
};

getFitnessClassification(userData).then((result) => {
  console.log("🏋️‍♂️ User Classification:", result);
});

export { getFitnessClassification };
