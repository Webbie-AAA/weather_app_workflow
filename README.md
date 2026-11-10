# Weather App Workflow

## Overview

A small ETL pipeline and weather dashboard. It pulls live weather data from the OpenWeatherMap API, saves it as JSON and CSV, and serves it through an Express API to a simple front end. A GitHub Actions workflow refreshes the data automatically.

- **Extract:** fetch current weather for a chosen city from OpenWeatherMap
- **Transform and load:** save the latest reading to `weather.json` and append each reading to `weather_log.csv`
- **Serve:** expose the data through API endpoints and display it in the browser

## Getting Started

### Prerequisites

- __Node.js__ (v20.11 or later, as the project uses `import.meta.dirname`)

- __npm__

- A free API key from [OpenWeatherMap](https://openweathermap.org/api)

### Installation

1. Clone the repo by running: `git clone your_github_url`

2. `cd` into the project folder

3. Install all the dependencies by running `npm install`
    - This project uses:

        - __Express__

        - __dotenv__

4. Set up your environment variables

    - Create a `.env` file in the root directory with the following:

        - `WEATHER_API_KEY=<your_openweathermap_api_key>`

        - `PORT=<port_of_your_choice>` (preferably __3000__)

        - `CITY=<city_name>` (optional, defaults to __London__)

5. Fetch the weather data

    - Run `node fetchWeather.js` to pull the latest data and create the `data/` folder

6. Run the server

    - Run `node app.js` (or your `npm start` script) and open `http://localhost:<port>`

### Running with Docker

The image uses `node:22-slim` and serves the app on port __5000__ by default.

```bash
docker build -t weather-app .
docker run -p 5000:5000 --env-file .env weather-app
```

Then open `http://localhost:5000`.

> [!NOTE]
> The container runs `app.js` only. It serves whatever is already in `data/`, which the GitHub Actions workflow keeps up to date. To refresh the data manually, run `node fetchWeather.js` locally first.

## Project Structure

```
weather_app_workflow/
├── .github/workflows/   # GitHub Actions workflow that refreshes the data
├── data/                # weather.json and weather_log.csv (generated)
├── public/              # front end: index.html, style.css, client.js
├── tests/               # tests
├── app.js               # Express server and API routes
├── fetchWeather.js      # fetches and stores weather data
├── Dockerfile
└── package.json
```

## Data Storage

Data is stored in flat files inside the `data/` folder, which `fetchWeather.js` creates automatically.

`weather.json` holds the latest reading, plus a `_last_updated_utc` timestamp.

`weather_log.csv` holds a running history, with one row added each time the data is fetched:

```csv
timestamp,city,temperature,description
```

## Automation

A GitHub Actions workflow runs `fetchWeather.js` on a schedule and commits the updated files in `data/` back to the repo (look for the `ci: update weather data` commits). Add your `WEATHER_API_KEY` as a repository secret under **Settings → Secrets and variables → Actions** so the workflow can run.

## API

### Base URL

`http://localhost:<port>` (or your deployed URL)

### API Endpoints

| Method | Endpoint           | Description                                      |
|--------|--------------------|--------------------------------------------------|
| GET    | /api/weather       | Retrieves the latest weather reading             |
| GET    | /api/weather-log   | Retrieves the temperature history for charting   |

### Example Requests

__To retrieve the latest weather__:

`curl -X GET http://localhost:<port>/api/weather`

__To retrieve the temperature log__:

`curl -X GET http://localhost:<port>/api/weather-log`

### Example Responses

`/api/weather` returns the OpenWeatherMap response with an added timestamp (shortened here):

```json
{
  "name": "London",
  "weather": [{ "main": "Clouds", "description": "overcast clouds" }],
  "main": { "temp": 11.4, "feels_like": 10.6, "humidity": 82 },
  "_last_updated_utc": "2026-11-10T09:00:00.000Z"
}
```

`/api/weather-log` returns two matching arrays, one of timestamps and one of temperatures:

```json
{
  "timestamps": ["2026-11-10T06:00:00.000Z", "2026-11-10T09:00:00.000Z"],
  "temps": [10.2, 11.4]
}
```

If no data has been fetched yet, both endpoints return a `404`:

```json
{ "error": "No weather data available" }
```

## Running Tests

Tests are written with [Jest](https://jestjs.io/) and check the generated data files, so make sure `data/` exists first (run `node fetchWeather.js`).

```bash
npm test
```

| Test | What it checks |
|------|----------------|
| `weather.json` exists | The latest reading was saved |
| Required keys | `main`, `weather[0].description` and `_last_updated_utc` are present, and the timestamp is a valid ISO date |
| London weather (JSON) | `name` is `London` |
| `weather_log.csv` header | Header is `timestamp,city,temperature,description`, there is at least one data row, and the temperature is a number |
| London weather (CSV) | The first data row's city is `London` |

> [!NOTE]
> The tests expect `London`, which is the default `CITY`. If you change `CITY` in your `.env`, update the tests too.
