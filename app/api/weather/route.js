import { NextResponse } from "next/server";

export async function GET() {
  const API_KEY = process.env.OPENWEATHER_API_KEY;
  // Sivakasi Coordinates
  const lat = "9.4533"; 
  const lon = "77.8024"; 
  
  if (!API_KEY) {
    // Return a mock gracefully for development if no key is provided yet
    return NextResponse.json({ 
      main: { temp: 32.5, humidity: 45 },
      weather: [{ description: "clear sky", icon: "01d" }],
      name: "Sivakasi"
    });
  }

  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`, {
      next: { revalidate: 600 } // Revalidate every 10 mins to save API calls
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch(error) {
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 });
  }
}
