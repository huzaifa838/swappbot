// backend/controllers/swappbot.message.js

import User from "../models/user.model.js";
import Bot from "../models/bot.model.js";
import { setPending, getPending, clearPending } from "../utils/state.js";
import { getWeather } from "../services/weather.service.js";

/* ------------------------
   1) HELPERS & UTILS
-------------------------*/

// Normalize text: lowercase + remove symbols (for coding Q&A, NOT for city)
function normalize(text = "") {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Levenshtein distance (for fuzzy typo match)
function levenshtein(a = "", b = "") {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const v0 = new Array(n + 1).fill(0);
  const v1 = new Array(n + 1).fill(0);

  for (let j = 0; j <= n; j++) v0[j] = j;

  for (let i = 0; i < m; i++) {
    v1[0] = i + 1;
    for (let j = 0; j < n; j++) {
      const cost = a[i] === b[j] ? 0 : 1;
      v1[j + 1] = Math.min(
        v1[j] + 1,     // insertion
        v0[j + 1] + 1, // deletion
        v0[j] + cost   // substitution
      );
    }
    for (let j = 0; j <= n; j++) v0[j] = v1[j];
  }

  return v1[n];
}

// Fuzzy match single word with small typo allowed
function fuzzyWordMatch(word = "", target = "", maxDist = 2) {
  const d = levenshtein(word, target);
  return d <= maxDist;
}

// Formatters
function patternSimple(text) {
  return `🤖 ${text}`;
}

function patternGreeting(problem, solution) {
  return `

🟢
${solution}

💬 You can ask me coding doubts like:
• "what is array"
• "how to use map in js"
• "difference between let and var"
`;
}

function patternCoding(title, explanation, example, tips = []) {
  return `
🧠 ${title}

📘 Explanation:
${explanation}

💻 Example:
\`\`\`js
${example}
\`\`\`

💡 Tips:
${tips.length ? tips.map((t, i) => `${i + 1}. ${t}`).join("\n") : "- Practice by writing small programs"}
`;
}

function patternError(problem, cause, fix, extra = "") {
  return `
❌ ERROR HELP

🟥 Problem:
${problem}

🟨 Possible Cause:
${cause}

🟩 Fix:
${fix}

${extra ? `ℹ️ Note:\n${extra}` : ""}
`;
}

function patternSteps(title, steps) {
  return `
📝 ${title}

${steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}
`;
}

/* ------------------------
   2) EXACT CODING Q&A BANK
   👉 Aage se tu yahi pe new Q&A add karega
   Rule:
   - key = lowercase, normal sentence (no ? , . etc)
   - type = "coding" | "steps" | "raw" | "greeting"
-------------------------*/

const exactBank = {
  // GREETINGS
  "hi": { type: "greeting" },
  "hello": { type: "greeting" },
  "hey": { type: "greeting" },
  "good morning": { type: "greeting" },
  "good night": { type: "greeting" },

  // JS BASICS
  "what is javascript": {
    type: "coding",
    title: "What is JavaScript?",
    explanation:
      "JavaScript is a high-level, interpreted programming language used mainly to add interactivity to web pages. It runs in the browser and also on the server (with Node.js).",
    example: `// Simple JS example
const name = "Huzaifa";
console.log("Hello " + name);`,
    tips: [
      "Start with variables, data types, and functions",
      "Practice in the browser console",
      "Build small projects like a counter or todo app"
    ]
  },

  "what is array in javascript": {
    type: "coding",
    title: "JavaScript Arrays",
    explanation:
      "An array is a list-like object used to store multiple values in a single variable. Values are ordered by index starting from 0.",
    example: `const nums = [10, 20, 30];
console.log(nums[0]); // 10
nums.push(40);        // add at end`,
    tips: [
      "Use push/pop to add/remove at end",
      "Use map/filter/reduce for transformations",
      "Indexes start from 0, not 1"
    ]
  },

  "difference between let var const": {
    type: "raw",
    text: `
🔍 Difference Between let, var, and const (JavaScript)

| Keyword | Scope     | Reassign? | Hoisted? | Common Use          |
|--------|-----------|----------|---------|----------------------|
| var    | function  | yes      | yes     | legacy code only     |
| let    | block     | yes      | no      | normal variables     |
| const  | block     | no       | no      | constants, references|

✔ Prefer "let" and "const"
✔ Avoid "var" in modern JavaScript
`
  },

  "what is function in javascript": {
    type: "coding",
    title: "Functions in JavaScript",
    explanation:
      "A function is a reusable block of code that performs a specific task. You can call it multiple times with different arguments.",
    example: `function add(a, b) {
  return a + b;
}

console.log(add(2, 3)); // 5`,
    tips: [
      "Use parameters for dynamic values",
      "Keep functions small and readable",
      "Arrow functions are shorter syntax for simple functions"
    ]
  },

  "what is callback": {
    type: "coding",
    title: "Callbacks in JavaScript",
    explanation:
      "A callback is a function passed as an argument to another function, to be executed later.",
    example: `function greet(name, cb) {
  console.log("Hello " + name);
  cb();
}

greet("Huzaifa", () => console.log("Welcome!"));`,
    tips: [
      "Common in async code (setTimeout, APIs)",
      "Can lead to callback hell – use Promises/async-await"
    ]
  },

  "what is promise": {
    type: "coding",
    title: "Promises in JavaScript",
    explanation:
      "A Promise represents a value that will be available now, later, or never. It has 3 states: pending, fulfilled, rejected.",
    example: `const p = new Promise((resolve, reject) => {
  setTimeout(() => resolve("Done"), 1000);
});

p.then(console.log).catch(console.error);`,
    tips: [
      "Use .then for success, .catch for error",
      "Promises solve callback hell",
      "async/await makes Promises easier to read"
    ]
  },

  "what is async await": {
    type: "coding",
    title: "async/await in JavaScript",
    explanation:
      "async/await is syntax on top of Promises that lets you write asynchronous code that looks synchronous.",
    example: `async function fetchUser() {
  try {
    const res = await fetch("/api/user");
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}`,
    tips: [
      "Use try/catch to handle errors",
      "await can only be used inside async functions",
      "Don't block UI with long loops inside async"
    ]
  },

  // HTML
  "what is html": {
    type: "coding",
    title: "What is HTML?",
    explanation:
      "HTML (HyperText Markup Language) defines the structure of web pages using tags like <div>, <p>, <h1>, etc.",
    example: `<!DOCTYPE html>
<html>
  <head><title>My Page</title></head>
  <body>
    <h1>Hello World</h1>
    <p>This is my first page</p>
  </body>
</html>`,
    tips: [
      "Use semantic tags like <header>, <main>, <footer>",
      "Don't nest block elements incorrectly",
      "Validate HTML with online validators"
    ]
  },

  // CSS
  "what is css": {
    type: "coding",
    title: "What is CSS?",
    explanation:
      "CSS (Cascading Style Sheets) is used to style HTML – colors, fonts, layout, animations etc.",
    example: `h1 {
  color: #00ffff;
  text-shadow: 0 0 10px #00ffff;
}`,
    tips: [
      "Learn box model (margin, border, padding, content)",
      "Practice flexbox and grid for layout",
      "Keep styles modular and reusable"
    ]
  },

  // REACT
  "what is react": {
    type: "coding",
    title: "What is React?",
    explanation:
      "React is a JavaScript library for building user interfaces using components and a virtual DOM.",
    example: `function Button({ label }) {
  return <button>{label}</button>;
}

// usage
<Button label="Click me" />`,
    tips: [
      "Think in components",
      "Use hooks like useState and useEffect",
      "Keep components small and focused"
    ]
  },

  "what is use state": {
    type: "coding",
    title: "React useState Hook",
    explanation:
      "useState lets you add state (data that changes) to functional components.",
    example: `const [count, setCount] = useState(0);

<button onClick={() => setCount(count + 1)}>
  {count}
</button>`,
    tips: [
      "Don't mutate state directly (use setters)",
      "State updates are async",
      "Group related state logically"
    ]
  },

  "what is use effect": {
    type: "coding",
    title: "React useEffect Hook",
    explanation:
      "useEffect lets you run side effects like fetching data, subscribing to events, or updating the document title.",
    example: `useEffect(() => {
  document.title = "Count: " + count;
}, [count]);`,
    tips: [
      "Dependency array controls when effect runs",
      "Clean up subscriptions in return function",
      "Keep effects focused on one responsibility"
    ]
  },

  // NODE + EXPRESS
  "what is node js": {
    type: "coding",
    title: "What is Node.js?",
    explanation:
      "Node.js is a JavaScript runtime built on Chrome's V8 engine that allows you to run JS on the server.",
    example: `import http from "http";

const server = http.createServer((req, res) => {
  res.end("Hello from Node");
});

server.listen(3000);`,
    tips: [
      "Great for real-time apps and APIs",
      "NPM provides thousands of packages",
      "Use Express for easier routing and middleware"
    ]
  },

  "what is express": {
    type: "coding",
    title: "Express.js Basics",
    explanation:
      "Express is a minimal web framework for Node.js that makes it easy to create APIs and web servers.",
    example: `import express from "express";
const app = express();

app.get("/hello", (req, res) => {
  res.json({ msg: "Hello" });
});

app.listen(4000);`,
    tips: [
      "Use middleware like express.json()",
      "Separate routes, controllers, and models",
      "Use async/await with try/catch in controllers"
    ]
  },

  // GIT
  "what is git": {
    type: "coding",
    title: "What is Git?",
    explanation:
      "Git is a version control system used to track changes in code, collaborate, and manage branches.",
    example: `git init
git add .
git commit -m "first commit"`,
    tips: [
      "Commit small and often",
      "Write clear commit messages",
      "Use branches for new features"
    ]
  },

  "how to push code to github": {
    type: "steps",
    title: "Push Code to GitHub",
    steps: [
      "Create a repo on GitHub",
      "In project: git init (only once)",
      "git remote add origin <repo-url>",
      "git add .",
      "git commit -m \"your message\"",
      "git push -u origin main (or master)"
    ]
  },

  // GENERIC LEARNING
  "how to become full stack developer": {
    type: "steps",
    title: "Roadmap: Full-Stack Developer",
    steps: [
      "Learn HTML, CSS, JavaScript very well",
      "Learn a frontend framework (React)",
      "Learn Git & GitHub",
      "Learn backend with Node.js + Express",
      "Learn database (MongoDB / PostgreSQL)",
      "Build 4–6 real projects (auth, CRUD, payments)",
      "Deploy apps (Vercel / Render / Railway / VPS)"
    ]
  }

  // 👉 yahan aage new Q&A add karte rehna
};

/* ------------------------
   3) UNIFIED CONTROLLER:
      Weather first → then Coding Q&A
-------------------------*/

export const messageBot = async (req, res) => {
  try {
    const userId = req.body.userId || "anonymous";
    const rawText = (req.body.message || req.body.text || "").toString();

    if (!rawText.trim()) {
      return res.status(400).json({ error: "Text is required" });
    }

    const key = normalize(rawText);
    const words = key.split(" ").filter(Boolean);

    // Save user message (ignore DB error)
    try {
      await User.create({ sender: "user", text: rawText });
    } catch (e) {
      console.error("Error saving user message:", e.message);
    }

    let reply;

    /* ---------------- WEATHER FLOW ---------------- */

    // 1️⃣ If we are waiting for city name
    if (getPending(userId) === "weather_location") {
      clearPending(userId);

      // Clean city input: remove numbers/emojis/symbols, extra spaces
      const city = rawText
        .replace(/[^a-zA-Z\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();

      if (!city) {
        reply = "❌ City name invalid. Please type a valid city name.";
      } else {
        try {
          const data = await getWeather(city);

          const prettyCity =
            city.charAt(0).toUpperCase() + city.slice(1);

          reply = `
🌤️ *Weather in ${prettyCity}*
Temperature: ${data.main.temp}°C
Feels Like: ${data.main.feels_like}°C
Humidity: ${data.main.humidity}%
Wind: ${data.wind.speed} m/s
Condition: ${data.weather[0].description}
`;
        } catch (err) {
          console.error("Weather API error:", err.message);
          // Show REAL API error text so you can debug (Invalid API key / city not found etc.)
          reply = `❌ Weather API error: ${err.message}`;
        }
      }

      try {
        await Bot.create({ sender: "bot", text: reply });
      } catch (e) {
        console.error("Error saving bot message:", e.message);
      }

      return res.status(200).json({
        userMessage: rawText,
        botMessage: reply
      });
    }

    // 2️⃣ Detect weather intent (with typos)
    const isWeatherIntent =
      words.some((w) =>
        ["weather", "mosam"].some((wk) => fuzzyWordMatch(w, wk, 2))
      ) ||
      key.includes("aaj ka weather") ||
      key.includes("today weather");

    if (isWeatherIntent) {
      setPending(userId, "weather_location");
      reply = "📍 Please enter your *city name* (Example: Delhi, Mumbai)";

      try {
        await Bot.create({ sender: "bot", text: reply });
      } catch (e) {
        console.error("Error saving bot message:", e.message);
      }

      return res.status(200).json({
        userMessage: rawText,
        botMessage: reply
      });
    }

    /* ---------------- CODING Q&A: EXACT MATCH ---------------- */

    const exact = exactBank[key];
    if (exact) {
      if (exact.type === "greeting") {
        reply = patternGreeting(
          "You greeted the bot.",
          "Hello! 👋 I'm SwappBot. Ask me any coding doubt – HTML, CSS, JS, React, Node, MongoDB, Git etc."
        );
      } else if (exact.type === "coding") {
        reply = patternCoding(
          exact.title,
          exact.explanation,
          exact.example,
          exact.tips || []
        );
      } else if (exact.type === "steps") {
        reply = patternSteps(exact.title, exact.steps);
      } else if (exact.type === "raw") {
        reply = exact.text;
      }
    }

    /* ---------------- CODING Q&A: FUZZY / TOPIC MATCH ---------------- */

    if (!reply) {
      // greetings with typo
      if (
        words.some(
          (w) => fuzzyWordMatch(w, "hi", 1) || fuzzyWordMatch(w, "hello", 2)
        )
      ) {
        reply = patternGreeting(
          "You greeted me.",
          "Hi! 👋 I'm ready to help you with coding concepts and errors."
        );
      }
      // array topic
      else if (words.some((w) => fuzzyWordMatch(w, "array", 2))) {
        const ex = exactBank["what is array in javascript"];
        reply = ex
          ? patternCoding(ex.title, ex.explanation, ex.example, ex.tips)
          : patternSimple("Arrays store multiple values in one variable.");
      }
      // loop topic
      else if (words.some((w) => fuzzyWordMatch(w, "loop", 1))) {
        reply = patternCoding(
          "Loops in JavaScript",
          "Loops are used to repeat a block of code multiple times.",
          `for (let i = 0; i < 5; i++) {
  console.log(i);
}`,
          [
            "Use for, while, for..of for most cases",
            "Be careful to avoid infinite loops"
          ]
        );
      }
      // error / bug / not working
      else if (
        key.includes("error") ||
        key.includes("bug") ||
        key.includes("not working")
      ) {
        reply = patternError(
          "You said something is giving an error / not working.",
          "Common causes: syntax mistakes, wrong imports, wrong path, missing await, CORS, wrong port.",
          "Paste your exact error message and relevant code (function, route, or component). I will debug step by step."
        );
      }
      // roadmap
      else if (key.includes("roadmap")) {
        reply = patternSteps("General Developer Roadmap", [
          "Choose main language (JavaScript for web)",
          "Learn basics: syntax, variables, loops, functions",
          "Learn web: HTML + CSS + JS",
          "Learn frontend framework (React)",
          "Learn backend (Node + Express) and database",
          "Build multiple projects and push to GitHub",
          "Learn deployment (Vercel, Render, etc.)"
        ]);
      }
    }

    /* ---------------- CODING Q&A: FULL FUZZY OVER exactBank KEYS ---------------- */

    if (!reply) {
      let bestKey = null;
      let bestDist = Infinity;

      for (const bankKey of Object.keys(exactBank)) {
        const d = levenshtein(key, bankKey);
        if (d < bestDist) {
          bestDist = d;
          bestKey = bankKey;
        }
      }

      // if reasonably close, use that answer
      if (bestKey && bestDist <= 3) {
        const ex = exactBank[bestKey];
        if (ex.type === "coding") {
          reply = patternCoding(
            ex.title,
            ex.explanation,
            ex.example,
            ex.tips || []
          );
        } else if (ex.type === "steps") {
          reply = patternSteps(ex.title, ex.steps);
        } else if (ex.type === "raw") {
          reply = ex.text;
        } else if (ex.type === "greeting") {
          reply = patternGreeting(
            "You greeted the bot.",
            "Hello! 👋 I'm SwappBot. Ask me any coding doubt – HTML, CSS, JS, React, Node, MongoDB, Git etc."
          );
        }
      }
    }

    /* ---------------- FALLBACK ---------------- */

    if (!reply) {
      reply = `
I don't have an exact answer for that yet, but I can still help. 😊

Try this:
1️⃣ Describe your coding question clearly  
2️⃣ Share the language (JS / React / Node / HTML / CSS etc.)  
3️⃣ If it's an error, copy the full error message

Example:
"React: Cannot read properties of undefined reading 'map' – here is my component code: …"

I'll then respond with:
- Problem explanation  
- Why it happens  
- How to fix it step-by-step  
`;
    }

    // Save bot reply
    try {
      await Bot.create({ sender: "bot", text: reply });
    } catch (e) {
      console.error("Error saving bot reply:", e.message);
    }

    return res.status(200).json({
      userMessage: rawText,
      botMessage: reply
    });
  } catch (error) {
    console.error("Error in messageBot controller:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// For compatibility: if kahin aur se "Message" import ho raha ho to bhi yehi function chale
export const Message = messageBot;
