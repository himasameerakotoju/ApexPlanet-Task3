const profilePic = document.getElementById("profilePic");
const name = document.getElementById("name");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const country = document.getElementById("country");

const generateBtn = document.getElementById("generateBtn");
const downloadBtn = document.getElementById("downloadBtn");
const saveBtn = document.getElementById("saveBtn");
const contactsList = document.getElementById("contactsList");

let currentUser = null;

// Load a user when the page opens
window.onload = getUser;

// Generate new user when button is clicked
generateBtn.addEventListener("click", getUser);

// Fetch Random User
async function getUser() {

    try {

        generateBtn.innerHTML = "Loading...";

        const response = await fetch("https://randomuser.me/api/");

        const data = await response.json();

        const user = data.results[0];
        currentUser = user;

        profilePic.src = user.picture.large;

        name.innerHTML =
            `${user.name.first} ${user.name.last}`;

        email.innerHTML = user.email;

        phone.innerHTML = user.phone;

        country.innerHTML = user.location.country;

        generateBtn.innerHTML =
            '<i class="fa-solid fa-arrows-rotate"></i> Generate New User';

    }

    catch(error){

        alert("Unable to load user.");

        console.log(error);

        generateBtn.innerHTML =
            '<i class="fa-solid fa-arrows-rotate"></i> Generate New User';

    }

}
// Download vCard

downloadBtn.addEventListener("click", () => {

    if (!currentUser) return;

    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${currentUser.name.first} ${currentUser.name.last}
TEL:${currentUser.phone}
EMAIL:${currentUser.email}
END:VCARD`;

    const blob = new Blob([vcard], { type: "text/vcard" });

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = `${currentUser.name.first}.vcf`;

    link.click();

});

// Save Contact

saveBtn.addEventListener("click", () => {

    if (!currentUser) return;

    let contacts =
        JSON.parse(localStorage.getItem("contacts")) || [];

    contacts.push(currentUser);

    localStorage.setItem(
        "contacts",
        JSON.stringify(contacts)
    );

    displayContacts();

});

// Display Contacts

function displayContacts(){

    contactsList.innerHTML = "";

    let contacts =
        JSON.parse(localStorage.getItem("contacts")) || [];

    contacts.forEach(user=>{

        contactsList.innerHTML += `

        <div class="contact-card">

            <h3>${user.name.first} ${user.name.last}</h3>

            <p>📧 ${user.email}</p>

            <p>📞 ${user.phone}</p>

            <p>🌍 ${user.location.country}</p>

        </div>

        `;

    });

}

displayContacts();