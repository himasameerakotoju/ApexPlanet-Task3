const quote = document.getElementById("quote");
const author = document.getElementById("author");

const newQuoteBtn = document.getElementById("newQuote");
const copyQuoteBtn = document.getElementById("copyQuote");
const tweetQuoteBtn = document.getElementById("tweetQuote");

// Load a quote when page opens
window.onload = getQuote;

// Fetch Random Quote
async function getQuote() {

    try {

        quote.innerHTML = "Loading...";
        author.innerHTML = "";

        const response = await fetch("https://dummyjson.com/quotes/random");

        if (!response.ok) {
            throw new Error("Failed to fetch");
        }

        const data = await response.json();

        quote.innerHTML = `"${data.quote}"`;
        author.innerHTML = `- ${data.author}`;

    } catch (error) {

        quote.innerHTML = "Unable to generate quote.";
        author.innerHTML = "";

        console.error(error);

    }

}
// New Quote Button
newQuoteBtn.addEventListener("click", getQuote);

// Copy Quote
copyQuoteBtn.addEventListener("click", () => {

    const text = `${quote.innerText} ${author.innerText}`;

    navigator.clipboard.writeText(text);

    alert("Quote copied successfully!");

});

// Tweet Quote
tweetQuoteBtn.addEventListener("click", () => {

    const tweet =
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            quote.innerText + " " + author.innerText
        )}`;

    window.open(tweet, "_blank");

});