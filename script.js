const apiKey = "YOUR_API_KEY";

async function getWeather() {
  const city = document.getElementById("cityInput").value;

  // Current weather API
  const urlCurrent = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  // 5-day forecast API
  const urlForecast = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  try {
    // Fetch both APIs at once
    const [resCurrent, resForecast] = await Promise.all([
      fetch(urlCurrent),
      fetch(urlForecast),
    ]);

    const dataCurrent = await resCurrent.json();
    const dataForecast = await resForecast.json();

    if (!resCurrent.ok || !resForecast.ok) {
      throw new Error("City not found");
    }

    // --- Current Weather HTML ---
    const weatherHTML = `
      <h2>${dataCurrent.name}, ${dataCurrent.sys.country}</h2>
      <p><strong>Temperature:</strong> ${dataCurrent.main.temp} °C</p>
      <p><strong>Humidity:</strong> ${dataCurrent.main.humidity}%</p>
      <p><strong>Wind Speed:</strong> ${dataCurrent.wind.speed} m/s</p>
      <p><strong>Condition:</strong> ${dataCurrent.weather[0].description}</p>
      <img src="https://openweathermap.org/img/wn/${dataCurrent.weather[0].icon}@2x.png" />
      <h3>5-Day Forecast</h3>
      <div id="forecast" class="forecast"></div>
    `;

    document.getElementById("weatherResult").innerHTML = weatherHTML;

    // --- Forecast Weather ---
    const forecastContainer = document.getElementById("forecast");
    forecastContainer.innerHTML = "";

    // Pick only one forecast per day (around 12:00:00)
    const dailyForecasts = dataForecast.list.filter((item) =>
      item.dt_txt.includes("12:00:00")
    );

    dailyForecasts.forEach((day) => {
      const forecastHTML = `
        <div class="forecast-day">
          <p><strong>${new Date(day.dt_txt).toLocaleDateString()}</strong></p>
          <p>${day.main.temp} °C</p>
          <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" />
          <p>${day.weather[0].description}</p>
        </div>
      `;
      forecastContainer.innerHTML += forecastHTML;
    });

    // Save city search
    saveCity(city);

  } catch (error) {
    document.getElementById("weatherResult").innerHTML = `<p>${error.message}</p>`;
  }
}

// --- Save city to localStorage ---
function saveCity(city) {
  let cities = JSON.parse(localStorage.getItem("cities")) || [];
  if (!cities.includes(city)) {
    cities.push(city);
    localStorage.setItem("cities", JSON.stringify(cities));
  }
  showHistory();
}

// --- Show search history ---
function showHistory() {
  const historyContainer = document.getElementById("history");
  const cities = JSON.parse(localStorage.getItem("cities")) || [];
  historyContainer.innerHTML = "";
  cities.forEach((city) => {
    const btn = document.createElement("button");
    btn.textContent = city;
    btn.onclick = () => {
      document.getElementById("cityInput").value = city;
      getWeather();
    };
    historyContainer.appendChild(btn);
  });
}

// Load search his
