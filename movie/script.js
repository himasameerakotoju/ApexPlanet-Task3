const apiKey = "58a5c930";

const searchBtn = document.getElementById("searchBtn");
const movieInput = document.getElementById("movieInput");
const topBtn = document.getElementById("topBtn");
const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {

        themeToggle.innerHTML = "☀️ Light Mode";

    } else {

        themeToggle.innerHTML = "🌙 Dark Mode";

    }

});
searchBtn.addEventListener("click", () => {
    const movie = movieInput.value.trim();

    if (movie === "") {
        alert("Please enter a movie name");
        return;
    }

    searchMovie(movie);
});
movieInput.addEventListener("keypress", (e) => {

    if (e.key === "Enter") {

        const movie = movieInput.value.trim();

        if (movie !== "") {

            searchMovie(movie);

        }

    }

});

// Autocomplete
movieInput.addEventListener("input", autocomplete);

async function autocomplete() {

    const text = movieInput.value.trim();

    const suggestions = document.getElementById("suggestions");

    suggestions.innerHTML = "";

    if (text.length < 2) return;

    const response = await fetch(
        `https://www.omdbapi.com/?apikey=${apiKey}&s=${text}`
    );

    const data = await response.json();

    if (data.Response === "True") {

        data.Search.slice(0, 5).forEach(movie => {

            suggestions.innerHTML += `
            <div class="suggestion-item"
            onclick="selectMovie('${movie.Title.replace(/'/g, "\\'")}')">
                ${movie.Title}
            </div>
            `;

        });

    }

}

function selectMovie(title) {

    movieInput.value = title;

    document.getElementById("suggestions").innerHTML = "";

    searchMovie(title);

}

async function searchMovie(movie) {

    const year = document.getElementById("year").value;
    const type = document.getElementById("type").value;

    let url = `https://www.omdbapi.com/?apikey=${apiKey}&t=${movie}`;

    if (year) url += `&y=${year}`;

    if (type) url += `&type=${type}`;

    try {
        document.getElementById("loading").innerHTML =
        '<div class="loader"></div>';

        const response = await fetch(url);

        const data = await response.json();

        document.getElementById("loading").innerHTML = "";

        if (data.Response === "False") {
            document.getElementById("movieResults").innerHTML = `
               <div class="error-card">
                  <h2>😔 Movie Not Found</h2>
                  <p>Please search with another movie name.</p>
                </div>
             `;

          return;
    }
        displayMovie(data);

    } catch (error) {

        document.getElementById("loading").innerHTML = "";

        alert("Something went wrong!");

        console.log(error);

    }

}

function displayMovie(movie) {

    document.getElementById("movieResults").innerHTML = `

    <div class="movie-card">

        <img src="${movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300x450?text=No+Image"}" alt="Poster">

        <h2>${movie.Title}</h2>

        <p><b>Year:</b> ${movie.Year}</p>

        <p><b>IMDb Rating:</b> ⭐ ${movie.imdbRating}</p>

        <p><b>Genre:</b> ${movie.Genre}</p>

        <p><b>Director:</b> ${movie.Director}</p>

        <p><b>Plot:</b> ${movie.Plot}</p>
        <button class="details-btn"
        onclick="openModal('${movie.imdbID}')">

        📄 View Details

        </button>

        <button onclick="addToFavorites('${movie.imdbID}')">
            ❤️ Add to Favorites
        </button>

    </div>

    `;

}

function addToFavorites(id) {

    fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${id}`)
        .then(response => response.json())
        .then(movie => {

            let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

            const exists = favorites.some(item => item.imdbID === movie.imdbID);

            if (exists) {
                alert("Movie already exists in Favorites!");
                return;
            }

            favorites.push(movie);

            localStorage.setItem("favorites", JSON.stringify(favorites));

            alert("Movie added to Favorites ❤️");

            displayFavorites();

        });

}
function displayFavorites() {

    const container = document.getElementById("favorites");

    container.innerHTML = "";

    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if (favorites.length === 0) {

        container.innerHTML = "<p>No favorite movies yet.</p>";

        return;

    }

    favorites.forEach(movie => {

        container.innerHTML += `

        <div class="favorite-card">

            <span>🎬 ${movie.Title}</span>

            <button onclick="removeFavorite('${movie.imdbID}')">
                Remove
            </button>

        </div>

        `;

    });

}
async function openModal(id){

    const response = await fetch(
        `https://www.omdbapi.com/?apikey=${apiKey}&i=${id}`
    );

    const movie = await response.json();

    document.getElementById("modalBody").innerHTML = `

        <img src="${movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300x450?text=No+Image"}" alt="Poster">

        <h2>${movie.Title}</h2>

        <p><b>Year:</b> ${movie.Year}</p>

        <p><b>Genre:</b> ${movie.Genre}</p>

        <p><b>IMDb:</b> ⭐ ${movie.imdbRating}</p>

        <p><b>Actors:</b> ${movie.Actors}</p>

        <p><b>Director:</b> ${movie.Director}</p>

        <p><b>Plot:</b> ${movie.Plot}</p>

        <br>

        <a href="https://www.youtube.com/results?search_query=${movie.Title}+Trailer"
           target="_blank">

            <button class="details-btn">

                ▶ Watch Trailer

            </button>

        </a>

    `;

    document.getElementById("movieModal").style.display = "block";

}
function saveRecentSearch(movie){

    let recent = JSON.parse(localStorage.getItem("recentMovies")) || [];

    // Duplicate remove
    recent = recent.filter(item => item.toLowerCase() !== movie.toLowerCase());

    // New movie add
    recent.unshift(movie);

    // Only last 5 searches
    if(recent.length > 5){
        recent.pop();
    }

    localStorage.setItem("recentMovies", JSON.stringify(recent));

    displayRecentSearches();

}
function displayRecentSearches(){

    const container = document.getElementById("recentSearches");

    container.innerHTML = "";

    let recent = JSON.parse(localStorage.getItem("recentMovies")) || [];

    recent.forEach(movie => {

        container.innerHTML += `
            <div class="recent-item"
                 onclick="searchMovie('${movie}')">

                ${movie}

            </div>
        `;

    });

}
document.querySelector(".close").onclick = function(){

    document.getElementById("movieModal").style.display = "none";

}
window.onclick = function(event){

    const modal = document.getElementById("movieModal");

    if(event.target == modal){

        modal.style.display = "none";

    }

}

function removeFavorite(id) {

    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    favorites = favorites.filter(movie => movie.imdbID !== id);

    localStorage.setItem("favorites", JSON.stringify(favorites));

    displayFavorites();

}

displayFavorites();
displayRecentSearches();
window.onscroll = function () {

    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {

        topBtn.style.display = "block";

    } else {

        topBtn.style.display = "none";

    }

};
topBtn.addEventListener("click", () => {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

});