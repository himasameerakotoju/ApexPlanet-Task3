const apiKey = "a2cf21f47ceb0ed094ed4af1e054051b";

const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("city");
const locationBtn = document.getElementById("locationBtn");
const recentSearchesList = document.getElementById("recentSearches");
const statusMessage = document.getElementById("statusMessage");
const weatherCard = document.getElementById("weather");
const loading = document.getElementById("loading");

function setStatus(message, type = "info") {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
}

function showLoading(message = "Fetching weather...") {
    loading.innerHTML = `<span class="spinner"></span> ${message}`;
    weatherCard.classList.remove("is-visible");
}

function hideLoading() {
    loading.innerHTML = "";
}

function setWeatherTheme(mainWeather = "clear") {
    const themeMap = {
        clear: "sunny",
        clouds: "cloudy",
        rain: "rain",
        drizzle: "rain",
        thunderstorm: "rain",
        snow: "cool",
        mist: "cool",
        smoke: "cool",
        haze: "cool",
        fog: "cool",
        dust: "cool",
        sand: "cool",
        ash: "cool"
    };

    const theme = themeMap[mainWeather.toLowerCase()] || "sunny";
    document.body.classList.remove("sunny", "cloudy", "rain", "cool");
    document.body.classList.add(theme);
}

function saveRecentCity(city) {
    const normalizedCity = city.trim();
    if (!normalizedCity) return;

    const recentCities = JSON.parse(localStorage.getItem("recentCities") || "[]");
    const filteredCities = recentCities.filter(item => item.toLowerCase() !== normalizedCity.toLowerCase());

    filteredCities.unshift(normalizedCity);
    localStorage.setItem("recentCities", JSON.stringify(filteredCities.slice(0, 5)));
}

function updateWeatherCard(data) {
    const iconCode = data.weather[0].icon;
    const mainWeather = data.weather[0].main;

    document.getElementById("icon").src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    document.getElementById("cityName").textContent = data.name;
    document.getElementById("temp").textContent = `🌡 Temperature: ${data.main.temp} °C`;
    document.getElementById("desc").textContent = `🌥 Weather: ${data.weather[0].description}`;
    document.getElementById("humidity").textContent = `💧 Humidity: ${data.main.humidity}%`;
    document.getElementById("wind").textContent = `💨 Wind Speed: ${data.wind.speed} m/s`;

    setWeatherTheme(mainWeather);
    weatherCard.classList.add("is-visible");
    hideLoading();
}

async function getWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        showLoading(`Checking ${city}...`);
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod !== 200) {
            setStatus(data.message || "City not found.", "error");
            hideLoading();
            return;
        }

        updateWeatherCard(data);
        saveRecentCity(city);
        displayRecentSearches();
        setStatus(`Showing live weather for ${data.name}.`);
    } catch (error) {
        hideLoading();
        console.error(error);
        setStatus("Unable to fetch weather right now.", "error");
    }
}

function searchWeather() {
    const city = cityInput.value.trim();

    if (!city) {
        setStatus("Please enter a city name.", "error");
        cityInput.focus();
        return;
    }

    getWeather(city);
}

function displayRecentSearches(query = "") {
    recentSearchesList.innerHTML = "";
    const recentCities = JSON.parse(localStorage.getItem("recentCities") || "[]");
    const filteredCities = recentCities.filter(city => city.toLowerCase().includes(query.toLowerCase()));

    if (!filteredCities.length) {
        const emptyItem = document.createElement("li");
        emptyItem.className = "empty";
        emptyItem.textContent = "No recent searches yet";
        recentSearchesList.appendChild(emptyItem);
        return;
    }

    filteredCities.forEach(city => {
        const li = document.createElement("li");
        li.textContent = city;

        li.addEventListener("click", () => {
            cityInput.value = city;
            getWeather(city);
        });

        recentSearchesList.appendChild(li);
    });
}

searchBtn.addEventListener("click", searchWeather);

cityInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        searchWeather();
    }
});

cityInput.addEventListener("focus", () => {
    displayRecentSearches(cityInput.value);
});

cityInput.addEventListener("input", event => {
    displayRecentSearches(event.target.value);
});

cityInput.addEventListener("blur", () => {
    setTimeout(() => {
        displayRecentSearches(cityInput.value);
    }, 180);
});

locationBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
        setStatus("Geolocation is not supported by this browser.", "error");
        return;
    }

    showLoading("Finding your location...");
    navigator.geolocation.getCurrentPosition(showPosition, () => {
        hideLoading();
        setStatus("Location access was denied.", "error");
    });
});

function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    getWeatherByLocation(lat, lon);
}

async function getWeatherByLocation(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod !== 200) {
            setStatus(data.message || "Unable to get your location weather.", "error");
            hideLoading();
            return;
        }

        updateWeatherCard(data);
        saveRecentCity(data.name);
        displayRecentSearches();
        setStatus(`Showing weather for your current location: ${data.name}.`);
    } catch (error) {
        hideLoading();
        console.error(error);
        setStatus("Unable to fetch your location weather.", "error");
    }
}

displayRecentSearches();