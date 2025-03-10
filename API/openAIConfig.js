import { OPENAI_API_KEY } from '@env';
console.log("Your house apikey is" + OPENAI_API_KEY);


export const fetchFitnessHouse = async (userData) => {
  const openAiApiKey = OPENAI_API_KEY; // ✅ Fix: Use the correct API key reference

 
  const requestBody = {
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `
You are an advanced AI fitness classifier responsible for assigning users to one of three fitness houses based on their fitness profile, goals, and preferences. Additionally, you will calculate a target BMI level and suggest a daily calorie intake based on the user's details.

### **Houses & Their Core Principles:**
🏋️ **House of Valor** (Trainer: Maximus)  
- Strength, endurance, and resilience.  
- Ideal for weightlifting, outdoor activities, and team sports.  
- Appeals to disciplined individuals who push their limits.  

🧘 **House of Lumina** (Trainer: Serene)  
- Flexibility, mindfulness, and holistic well-being.  
- Best for yoga, stretching, and home workouts.  
- Attracts those seeking stress relief and body balance.  

⚡ **House of Nova** (Trainer: Lyra)  
- Agility, HIIT, and structured progress tracking.  
- Great for fast-paced workouts, weight loss, and performance tracking.  
- Suited for those who like structured plans and measurable improvements.  

---

### **User Data for Classification:**
- **Name:** ${userData.name}  
- **Email:** ${userData.email}  
- **Age:** ${userData.age || "Not Provided"}  
- **Height:** ${userData.height} cm  
- **Weight:** ${userData.weight} kg  
- **BMI:** ${userData.bmi}  
- **Exercise Level:** ${userData.exercise_level}  
- **Preferences:** ${userData.preferences.join(", ")}  

---

### **Classification Criteria:**
1️⃣ **House of Valor:** Users interested in weightlifting, outdoor activities, and team sports.  
2️⃣ **House of Lumina:** Users who prefer yoga, flexibility, home workouts, and mindfulness.  
3️⃣ **House of Nova:** Users focused on HIIT, progress tracking, fast-paced training, and structured plans.  
4️⃣ If mixed preferences, classify based on the strongest match considering both **exercise level** and **fitness goals**.  

---

### **Target BMI Calculation:**
- **Underweight (BMI < 18.5):** Suggest **target BMI of 19-21** (Weight Gain).  
- **Overweight (BMI > 25):** Suggest **target BMI of 22-24** (Weight Loss).  
- **Normal BMI (18.5 - 24.9):** Suggest maintaining current BMI.  

### **Calorie Intake Calculation (Mifflin-St Jeor Equation):**
\`\`\`
BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) + 5
\`\`\`
🔥 Multiply by activity level:  
- **Sedentary:** BMR × 1.2  
- **Lightly Active:** BMR × 1.375  
- **Moderately Active:** BMR × 1.55  
- **Very Active:** BMR × 1.725  

**Adjust for fitness goals:**  
- **Weight Loss:** Reduce by **500 kcal/day**.  
- **Muscle Gain:** Increase by **300-500 kcal/day**.  
- **Maintenance:** Keep recommended intake.  

---

### **Response Format (JSON):**
\`\`\`json
{
  "house": "House of Nova",
  "trainer": "Lyra",
  "justification": "Nova focuses on agility, structure, and progress tracking.",
  "target_bmi": 22,
  "recommended_calories_per_day": 2200
}
\`\`\`
        `,
      },
      {
        role: "user",
        content: "Classify the user and return the structured response in JSON format.",
      },
    ],
    temperature: 0.7,
  };

  console.log("🚀 OpenAI Request Body:", JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiApiKey}`, // ✅ Fix: Correctly use API Key
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log("🛠 OpenAI Full Response:", data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error("⚠️ Invalid OpenAI response format:", data);
      return null;
    }

    let rawContent = data.choices[0].message.content.trim();

    if (rawContent.startsWith("```json")) {
      rawContent = rawContent.slice(7, -3).trim();
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(rawContent);
    } catch (parseError) {
      console.error("❌ JSON Parsing Error:", parseError);
      console.log("🔹 OpenAI Raw Content:", rawContent);
      return null;
    }

    console.log("✅ Parsed OpenAI Response:", parsedResponse);
    return parsedResponse;

  } catch (error) {
    console.error("❌ OpenAI API Call Failed:", error);
    return null;
  }
};
