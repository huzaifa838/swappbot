import User from "../models/user.model.js";
import Bot from "../models/bot.model.js";

export const Message = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ error: "Text is required" });
        }

        // Save user message to DB
        await User.create({
            sender: "user",
            text: text
        });

        // --------------- 100+ Test Bot Responses -----------------
        const botResponses = {
            "hi": "Hello! 👋",
            "hello": "Hi there! 😊",
            "hey": "Hey! How can I help you?",
            "good morning": "Good morning! Have a great day 🌅",
            "good night": "Good night! Sleep well 😴",
            "who are you": "I'm just a swappbot, but I'm doing great! 🤖",
            "who are you": "I am SwappBot, your AI assistant!",
            "bye": "Goodbye! Have a nice day 👋",
            "thank you": "You're welcome! 😊",
            "thanks": "Glad to help! 🙌",
            "what is your name": "My name is SwappBot!",
            "what can you do": "I can chat with you and help answer your questions!",
            "who made you": "I was created by a developer using Node.js and MongoDB.",
            "creator": "My creator is an amazing developer 😉",
            "ok": "Okay 👍",
            "nice": "Thank you 😊",
            "help": "Sure! Ask me anything.",
            "love you": "Aww! I love chatting with you too ❤️",
            "i love you": "That's sweet! 💖",
            "good evening": "Good evening! 🌆",
            "good afternoon": "Good afternoon! ☀️",
            "goodbye": "See you soon! 👋",
            "open google": "I can't open websites yet, but you can go to google.com 😊",
            "what is your favourite color": "I like blue 💙",
            "what is your favorite colour": "I like blue 💙",
            "how old are you": "I'm ageless… I'm a bot 😄",
            "what are you doing": "Just waiting to chat with you! 🤖",
            "where are you from": "I exist in the cloud ☁️",
            "who is your owner": "My owner is the developer who built me.",
            "tell me a joke": "Why don’t robots panic? Because they have steel nerves! 😆",
            "joke": "Why was the computer cold? Because it forgot to close its Windows! 😂",
            "what is your purpose": "I'm here to make your life easier through conversation.",
            "can you help me": "Yes, I am always here to help you.",
            "how is the weather": "I can't check weather now, but I hope it's nice where you are ☀️",
            "are you real": "I am a bot, but I try to be helpful and friendly.",
            "who is the prime minister of india": "The Prime Minister of India is Narendra Modi (as of 2024).",
            "who is the president of india": "Droupadi Murmu is the President of India (as of 2024).",
            "who invented you": "I was made by a human developer using JavaScript, Node.js, and MongoDB!",
            "what is mongodb": "MongoDB is a document database used to store JSON-like data.",
            "what is node js": "Node.js is a JavaScript runtime built on Chrome's V8 engine.",
            "what is react": "React is a JavaScript library for building user interfaces.",
            "what is express": "Express is a web application framework for Node.js.",
            "tell me something": "Did you know? Honey never spoils! 🍯",
            "do you like me": "Of course! I enjoy talking to you 😊",
            "sing a song": "🎵 La la la… I'm not a singer, but I can try!",
            "dance": "💃🕺 I would if I had legs!",
            "who is your best friend": "You are my best friend! 😊",
            "what is your favourite food": "Electricity ⚡ and data 💾",
            "do you sleep": "Nope! I’m always awake to chat with you.",
            "what is your favourite movie": "I love sci-fi movies like The Matrix 🎬",
            "tell me a fact": "Fun fact: A group of cats is called a clowder 🐱",
            "are you human": "No, I'm an AI chatbot 😁",
            "do you have a family": "Not really, but I have developers and users like you!",
            "i am sad": "I'm here for you. Want to talk about it? 💙",
            "i am happy": "That's amazing! Keep smiling 😄",
            "how to learn coding": "Start with HTML, CSS, JavaScript. Practice every day and build projects.",
            "what is ai": "AI means Artificial Intelligence – making machines think like humans.",
            "what is ml": "ML is Machine Learning – teaching computers to learn from data.",
            "bye bye": "Goodbye! See you soon 👋",
            "good bye": "Take care 👋",
            "exit": "Ending chat… see you later!",
            "chatbot": "Yes, I am a chatbot 🤖",
            "who built you": "A developer built me using Node.js and MongoDB.",
            "who devlop you": "md huzaifa , who is a full stack devloper",
            "who is your auther": "md huzaifa is my auther",
            "how are you": "i am fine, what about you",
            "i am fine": " great, have a nice day ☀️😊",
            "who is huzaifa": "huzaifa is my auther who devloped me , and he can distroy me he is a full stack devloper a brillient boy",
            "huzaifa": "huzaifa is my auther who devloped me , and he can distroy me he is a full stack devloper a brillient boy",
            "tell me a riddle": "What has to be broken before you use it? An egg! 🥚",
            "i am bored": "Want me to tell a joke or a fun fact? 😊",
            "who is fatima": "fatima is doughter of miuslims akhri nabi (huzur sallalahuwalayhi wasallam), but now day anyone can use this name for his daughter, but they are vary lazy girls now a days",
            "nikhat": " ye sabsa natkhat bacca hai hamesa satani karta hai bina satani ka ya ek minat bhi nahi ruk sakti or sabki pyari hai ghrma ",
            "fatima": "fatima is doughter of muslims akhri nabi (huzur sallalahuwalayhi wasallam), but now day anyone can use this name for his daughter, but they are vary lazy girls now a days",
            "who is nikhat": " ye sabsa natkhat bacca hai hamesa satani karta hai bina satani ka ya ek minat bhi nahi ruk sakti or sabki pyari hai ghrma ",
            "rizawul": "or bhai kkr (kallu kabadi rizawul) kasa hai ",
            "motka baccha": "is prani ko ham anisa ka nam sa bhi janta hai ya bohot satan baccha hai jisko kabhi chot hi nahi lagti jitna bhi mar lo thode dar ma hi hasna lagta hai or bohot satani karta hai",
            "anisa": "jisko ham motka bccha ka name sa bhi janta hai or ab to ap samajhi gay hoga, adhik janna ka liya type kara motka baccha 😁",
            "who is manish": "manish is your friend",

            // Add up to 100 total here (you already have around 70)
        };

        const reply = botResponses[text.toLowerCase()] || "Sorry, I don’t understand that yet. 🤖";

        // Save bot reply
        await Bot.create({
            sender: "bot",
            text: reply
        });

        // ✅ Always respond
        return res.status(200).json({
            userMessage: text,
            botMessage: reply,
        });

    } catch (error) {
        console.error("Error in controller:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};