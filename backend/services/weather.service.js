import axios from "axios";

const API_KEY = process.env.WEATHER_API_KEY;

export async function getWeather(city) {
  if (!API_KEY || API_KEY.trim() === "") {
    console.error("❌ API KEY IS EMPTY OR NOT LOADED");
    throw new Error("Weather API key missing in .env");
  }

  const cleanCity = city.trim().toLowerCase();

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${cleanCity}&appid=${API_KEY}&units=metric`;

  try {
    const res = await axios.get(url);
    return res.data;
  } catch (err) {
    console.error("❌ WEATHER ERROR:", err.response?.data);
    throw new Error(err.response?.data?.message || "Weather API failed");
  }
}
