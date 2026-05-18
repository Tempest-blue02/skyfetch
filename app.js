function WeatherApp() {

  this.apiKey = "YOUR_API_KEY";

  this.weatherContainer =
    document.getElementById("weather-container");

  this.searchBtn =
    document.getElementById("search-btn");

  this.cityInput =
    document.getElementById("city-input");
}

WeatherApp.prototype.init = function () {

  this.searchBtn.addEventListener(
    "click",
    this.handleSearch.bind(this)
  );

  this.cityInput.addEventListener(
    "keypress",
    (e) => {
      if (e.key === "Enter") {
        this.handleSearch();
      }
    }
  );

  this.showWelcome();
};

WeatherApp.prototype.showWelcome = function () {

  this.weatherContainer.innerHTML = `
    <div class="welcome">
      <h2>Welcome to SkyFetch</h2>
      <p>Search for a city to view weather updates</p>
    </div>
  `;
};

WeatherApp.prototype.handleSearch = function () {

  const city = this.cityInput.value.trim();

  if (city === "") {
    this.showError("Please enter a city name");
    return;
  }

  this.getWeather(city);
};

WeatherApp.prototype.showLoading = function () {

  this.weatherContainer.innerHTML = `
    <div class="loading">
      <h2>Loading weather data...</h2>
    </div>
  `;
};

WeatherApp.prototype.showError = function (message) {

  this.weatherContainer.innerHTML = `
    <div class="error">
      <h2>${message}</h2>
    </div>
  `;
};

WeatherApp.prototype.getForecast = async function (city) {

  const forecastURL =
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${this.apiKey}&units=metric`;

  const response = await fetch(forecastURL);

  if (!response.ok) {
    throw new Error("Forecast data not found");
  }

  return response.json();
};

WeatherApp.prototype.getWeather = async function (city) {

  this.showLoading();

  try {

    const weatherURL =
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.apiKey}&units=metric`;

    const [weatherData, forecastData] =
      await Promise.all([

        fetch(weatherURL).then((res) => {

          if (!res.ok) {
            throw new Error("City not found");
          }

          return res.json();
        }),

        this.getForecast(city)
      ]);

    this.displayWeather(weatherData);

    const processedForecast =
      this.processForecastData(forecastData.list);

    this.displayForecast(processedForecast);

  } catch (error) {

    this.showError(error.message);
  }
};

WeatherApp.prototype.displayWeather = function (data) {

  const icon =
    `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

  this.weatherContainer.innerHTML = `
    <div class="weather-card">

      <h2>${data.name}, ${data.sys.country}</h2>

      <img src="${icon}" alt="Weather Icon">

      <h3>${data.main.temp}°C</h3>

      <p>${data.weather[0].description}</p>

      <p>Humidity: ${data.main.humidity}%</p>

      <p>Wind Speed: ${data.wind.speed} m/s</p>

    </div>

    <div class="forecast-section">

      <h2 class="forecast-title">
        5-Day Forecast
      </h2>

      <div class="forecast-container" id="forecast-container">

      </div>

    </div>
  `;
};

WeatherApp.prototype.processForecastData = function (forecastList) {

  const dailyForecast = forecastList.filter((item) =>
    item.dt_txt.includes("12:00:00")
  );

  return dailyForecast.slice(0, 5);
};

WeatherApp.prototype.displayForecast = function (forecastData) {

  const forecastContainer =
    document.getElementById("forecast-container");

  forecastData.forEach((item) => {

    const date = new Date(item.dt_txt);

    const day = date.toLocaleDateString("en-US", {
      weekday: "long"
    });

    const icon =
      `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;

    forecastContainer.innerHTML += `
      <div class="forecast-card">

        <h3>${day}</h3>

        <img src="${icon}" alt="Weather Icon">

        <h2>${item.main.temp}°C</h2>

        <p>${item.weather[0].description}</p>

      </div>
    `;
  });
};

const app = new WeatherApp();

app.init();
