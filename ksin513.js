// ----------------- Section Navigation -----------------
const sections = document.querySelectorAll("main section");
document.querySelectorAll("header a").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    sections.forEach((sec) => (sec.style.display = "none"));
    const target = document.querySelector(link.getAttribute("href"));
    target.style.display = "block";
  });
});

// ----------------- About Section -----------------
async function loadAbout() {
  try {
    const response = await fetch("https://cws.auckland.ac.nz/museum/api/Intro");
    if (!response.ok) throw new Error("Network response was not ok");

    const text = await response.text(); //
    console.log("Intro text:", text); //
    document.getElementById("about-text").textContent = text;
  } catch (error) {
    console.error("Error fetching intro:", error);
    document.getElementById("about-text").textContent =
      "Failed to load museum introduction.";
  }
}

loadAbout();

// ----------------- Artefacts Section -----------------
const artefactList = document.getElementById("artefact-list");
const searchInput = document.getElementById("artefact-search");

// Function to display artefacts
function displayArtefacts(data) {
  artefactList.innerHTML = ""; // clear old results

  if (!data || data.length === 0) {
    artefactList.innerHTML = "<p>No artefacts found.</p>";
    return;
  }

  data.forEach((a) => {
    const div = document.createElement("div");
    div.classList.add("artefact-item");

    // Build the image URL from the ID
    const imgURL = `https://cws.auckland.ac.nz/museum/api/ArtefactImage/${a.id}`;

    div.innerHTML = `
      <h3>${a.title}</h3>
      <img src="${imgURL}" alt="${a.title}" style="max-width:200px; border-radius:8px;">
      <p>${a.description}</p>
    `;

    artefactList.appendChild(div);
  });
}

// Function to fetch artefacts from the API
function fetchArtefacts(term = "") {
  // Use AllArtefacts if search term is empty
  const url = term
    ? `https://cws.auckland.ac.nz/museum/api/Artefacts/${term}`
    : `https://cws.auckland.ac.nz/museum/api/AllArtefacts`;

  fetch(url)
    .then((res) => res.json())
    .then(displayArtefacts)
    .catch((err) => {
      console.error("Error fetching artefacts:", err);
      artefactList.innerHTML = "<p>Failed to load artefacts.</p>";
    });
}

// Event listener for live searching
searchInput.addEventListener("input", () => {
  const term = searchInput.value.trim();
  fetchArtefacts(term);
});

// Load all artefacts initially
fetchArtefacts();

// ----------------- Register Section -----------------

const regresponseModal = document.getElementById("response-modal");
const regresponseText = document.getElementById("response-text");
const regcloseResponse = document.querySelector(".close-response");

// Register button handler
document.getElementById("register-btn").addEventListener("click", () => {
  const username = document.getElementById("reg-username").value.trim();
  const password = document.getElementById("reg-password").value.trim();

  if (!username || !password) {
    showResponse("Please enter both username and password.");
    return;
  }

  fetch("https://cws.auckland.ac.nz/museum/api/Register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
    .then((res) => res.text().then((text) => ({ status: res.status, text })))
    .then(({ status, text }) => {
      if (status >= 200 && status < 300) {
        showResponse(text || "Registered successfully!");
      } else {
        showResponse(text || `Registration failed (status ${status}).`);
      }
    })
    .catch((err) => showResponse("Error: " + err.message));
});

// Show response modal function
function showResponse(message) {
  regresponseText.textContent = message;
  responseModal.style.display = "flex";
}

// Close modal
regcloseResponse.addEventListener("click", () => {
  regresponseModal.style.display = "none";
});

// Close when clicking outside the modal
window.addEventListener("click", (e) => {
  if (e.target === responseModal) responseModal.style.display = "none";
});

// ----------------- Guestbook Section -----------------
const loginModal = document.getElementById("login-modal");
const loginBtn = document.getElementById("login-btn");
const commentsFrame = document.getElementById("comments-iframe");
const submitCommentBtn = document.getElementById("submit-comment-btn");
const commentText = document.getElementById("comment-text");
const responseModal = document.getElementById("response-modal");
const responseText = document.getElementById("response-text");

const closeLogin = document.querySelector(".close-login");
const closeResponse = document.querySelector(".close-response");

let isLoggedIn = false;
let authHeader = "";

// Handle comment submit
submitCommentBtn.addEventListener("click", () => {
  const comment = commentText.value.trim();
  if (!comment) {
    showResponse("Please enter a comment before submitting.");
    return;
  }

  if (!isLoggedIn) {
    loginModal.style.display = "flex";
  } else {
    submitComment(comment);
  }
});

// Close login modal
closeLogin.addEventListener("click", () => {
  loginModal.style.display = "none";
});

// Handle login (real API authentication)
loginBtn.addEventListener("click", () => {
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value.trim();

  if (!username || !password) {
    showResponse("Please enter both username and password.");
    return;
  }

  const testAuthHeader = "Basic " + btoa(username + ":" + password);

  // Test login by posting a dummy comment
  fetch("https://cws.auckland.ac.nz/museum/api/Comment?comment=testlogin", {
    method: "POST",
    headers: { Authorization: testAuthHeader },
  })
    .then((res) => {
      if (res.status === 401) {
        throw new Error("Invalid username or password.");
      }
      if (res.status >= 200 && res.status < 300) {
        authHeader = testAuthHeader;
        isLoggedIn = true;
        loginModal.style.display = "none";
        showResponse(`Logged in as ${username}`);
      } else {
        throw new Error("Login failed. Please try again.");
      }
    })
    .catch((err) => {
      showResponse(err.message);
    });
});

// Submit actual comment
function submitComment(comment) {
  const url = `https://cws.auckland.ac.nz/museum/api/Comment?comment=${encodeURIComponent(
    comment
  )}`;

  fetch(url, {
    method: "POST",
    headers: {
      accept: "text/plain",
      ...(isLoggedIn && { Authorization: authHeader }),
    },
  })
    .then((res) => res.text().then((text) => ({ status: res.status, text })))
    .then(({ status, text }) => {
      if (status === 401) {
        showResponse("Authentication required — please login.");
        loginModal.style.display = "flex";
        isLoggedIn = false;
      } else if (status >= 200 && status < 300) {
        showResponse(text || "Comment submitted successfully.");
        commentText.value = "";
        commentsFrame.src = commentsFrame.src; // reload iframe
      } else {
        showResponse(text || `Failed to submit comment (status ${status}).`);
      }
    })
    .catch((err) => showResponse("Error: " + err.message));
}

// Show response modal
function showResponse(message) {
  responseText.textContent = message;
  responseModal.style.display = "flex";
}

// Close response modal
closeResponse.addEventListener("click", () => {
  responseModal.style.display = "none";
});

// Close modals on outside click
window.addEventListener("click", (e) => {
  if (e.target === loginModal) loginModal.style.display = "none";
  if (e.target === responseModal) responseModal.style.display = "none";
});

// ----------------- Events Section -----------------
const eventsContainer = document.getElementById("events-container");

async function loadEvents() {
  try {
    // Get total number of events
    const countRes = await fetch(
      "https://cws.auckland.ac.nz/museum/api/EventCount"
    );
    const count = await countRes.json();

    // Fetch each event
    for (let i = 0; i < count; i++) {
      const res = await fetch(
        `https://cws.auckland.ac.nz/museum/api/Event/${i}`
      );
      const eventText = await res.text();

      // Parse the VCALENDAR text to extract fields
      const titleMatch = eventText.match(/SUMMARY:(.*)/);
      const descriptionMatch = eventText.match(/DESCRIPTION:(.*)/);
      const locationMatch = eventText.match(/LOCATION:(.*)/);
      const dtstartMatch = eventText.match(/DTSTART:(\d{8}T\d{6}Z)/);
      const dtendMatch = eventText.match(/DTEND:(\d{8}T\d{6}Z)/);

      const title = titleMatch ? titleMatch[1] : "No Title";
      const description = descriptionMatch ? descriptionMatch[1] : "";
      const location = locationMatch ? locationMatch[1] : "";
      const dtstart = dtstartMatch ? parseICalDate(dtstartMatch[1]) : "";
      const dtend = dtendMatch ? parseICalDate(dtendMatch[1]) : "";

      // Create event card
      const card = document.createElement("div");
      card.style.flex = "1 1 300px";
      card.style.border = "1px solid #ccc";
      card.style.padding = "10px";
      card.style.borderRadius = "5px";
      card.style.background = "#f9f9f9";

      card.innerHTML = `
        <h3>${title}</h3>
        <p><strong>Description:</strong> ${description}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Start:</strong> ${dtstart}</p>
        <p><strong>End:</strong> ${dtend}</p>
        <a href="https://cws.auckland.ac.nz/museum/api/Event/${i}" target="_blank">Add to Calendar</a>
      `;

      eventsContainer.appendChild(card);
    }
  } catch (err) {
    console.error("Error loading events:", err);
    eventsContainer.innerHTML = "<p>Failed to load events.</p>";
  }
}

// Helper: convert iCal UTC datetime to local string
function parseICalDate(dt) {
  // dt format: YYYYMMDDTHHMMSSZ
  const year = dt.substring(0, 4);
  const month = dt.substring(4, 6);
  const day = dt.substring(6, 8);
  const hour = dt.substring(9, 11);
  const min = dt.substring(11, 13);
  const sec = dt.substring(13, 15);
  const date = new Date(Date.UTC(year, month - 1, day, hour, min, sec));
  return date.toLocaleString(); // local date & time
}

// Load events on page load
loadEvents();

// ----------------- Visits Section -----------------
const svg = document.getElementById("visits-graph");
const rawDataEl = document.getElementById("visits-raw");
const legendEl = document.getElementById("legend");

async function loadVisits() {
  try {
    const res = await fetch("https://cws.auckland.ac.nz/museum/api/Log");
    const data = await res.json();

    const visitsLine = data.map((d) => d.visits).join(", ");
    const firstTimeLine = data.map((d) => d.firstTimeVisits).join(", ");
    rawDataEl.textContent = visitsLine + "\n" + firstTimeLine;

    const padding = 50;
    const width = 600;
    const height = 300;

    const dates = data.map((d) => d.date);
    const visits = data.map((d) => d.visits);
    const firstTime = data.map((d) => d.firstTimeVisits);

    const maxY = Math.max(...visits, ...firstTime);
    const minY = 0;

    const xScale = (i) =>
      padding + (i / (dates.length - 1)) * (width - 2 * padding);
    const yScale = (v) =>
      height - padding - ((v - minY) / (maxY - minY)) * (height - 2 * padding);

    // Clear SVG
    svg.innerHTML = `
      <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${
      height - padding
    }" stroke="black"/>
      <line x1="${padding}" y1="${height - padding}" x2="${
      width - padding
    }" y2="${height - padding}" stroke="black"/>
      <text x="${padding - 30}" y="${yScale(
      minY
    )}" text-anchor="end" font-size="12px">${minY}</text>
      <text x="${padding - 30}" y="${yScale(
      maxY
    )}" text-anchor="end" font-size="12px">${maxY}</text>
    `;

    const createLinePath = (arr) =>
      arr
        .map((v, i) => `${i === 0 ? "M" : "L"}${xScale(i)} ${yScale(v)}`)
        .join(" ");

    [
      { data: visits, color: "blue" },
      { data: firstTime, color: "orange" },
    ].forEach(({ data, color }) => {
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      path.setAttribute("d", createLinePath(data));
      path.setAttribute("stroke", color);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke-width", "1");
      svg.appendChild(path);
    });

    // X-axis labels (first & last only)
    [0, dates.length - 1].forEach((i) => {
      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      text.setAttribute("x", xScale(i));
      text.setAttribute("y", height - padding + 20);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("font-size", "12px");
      text.textContent = dates[i];
      svg.appendChild(text);
    });

    // HTML legend
    legendEl.innerHTML = `
      <div style="display:flex; justify-content:center; gap:20px; font-size:16px;">
        <div><span style="display:inline-block; width:15px; height:15px; background:blue; margin-right:6px;"></span>Total Visits</div>
        <div><span style="display:inline-block; width:15px; height:15px; background:orange; margin-right:6px;"></span>First-Time Visits</div>
      </div>
    `;
  } catch (err) {
    rawDataEl.textContent = "Failed to load visit data: " + err;
  }
}

loadVisits();

// Fetch and display footer version info
fetch("https://cws.auckland.ac.nz/museum/api/Version")
  .then((res) => res.text())
  .then((versionText) => {
    document.getElementById("footer-text").textContent = versionText;
  })
  .catch((err) => {
    console.error("Error fetching version:", err);
    document.getElementById("footer-text").textContent = "Version unavailable";
  });
