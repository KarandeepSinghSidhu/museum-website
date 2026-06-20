# Bob Doran Museum of Computing

A single-page web application for the Bob Doran Museum of Computing at the University of Auckland.

## Features

- **About** — loads the museum introduction from the API
- **Artefacts** — browse and live-search the museum's collection with images
- **Register** — create a new museum account
- **Guestbook** — view and submit comments (requires login)
- **Events** — displays upcoming museum events parsed from iCalendar format
- **Visitor Statistics** — SVG line chart showing total vs first-time visits over time

## Tech Stack

- HTML, CSS, JavaScript (vanilla)
- University of Auckland Museum REST API (`cws.auckland.ac.nz/museum/api`)

## Getting Started

No build step required. Just open `ksin513.html` in a browser.

```bash
ksin513.html
```

> Note: Some features (guestbook, register) require a valid museum account.

## Project Structure

```
ksin513.html   # Main HTML structure
ksin513.css    # Styles
ksin513.js     # All JavaScript logic
a4.svg         # SVG asset
```
