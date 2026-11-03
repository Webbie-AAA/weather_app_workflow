//Extract of ETL - Real time weather data from external API
// Save in JSON in CSV (comma separated values)

import fs from 'fs' //file System - let us read and write files. JSON and CSV
import path from 'path' //File path that works for all OS systems
import dotenv from 'dotenv' //Load our secret values

dotenv.config()

//where we will save our data
//gives us the folder where that file lives
const DATA_DIR = path.join(import.meta.dirname, 'data') //join all args together and normalise the resulting path
//Above creates path
// Second creates folder/ Recursive true means do nothing if the folder if its already there. 
// We will let our own pipeline create the folder for us. 
fs.mkdirSync(DATA_DIR, {recursive: true})


//we want the file to be created in that data directry and its a file called weather.json
const WEATHER_FILE = path.join(DATA_DIR, 'weather.json')
const LOG_FILE = path.join(DATA_DIR, 'weather_log.csv')
//.csv continually loading files. 

//How do we create a weather function that stores the info in csv and json
// We do a function that speaks to the API
console.log('Saving files to: DATA_DIR')

export async function fetchWeather(){
    const apiKey = process.env.WEATHER_API_KEY 
    const city = process.env.CITY || 'London'

    console.log('API key loaded:', apiKey ? 'yes' : 'NO')
    if (!apiKey) return

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`

    try {
        const response = await fetch(url)
        console.log('API status:', response.status)
        if (!response.ok){
            throw new Error(`HTTP error! Status:${response.status}`)
        }
        const data = await response.json()
        const nowUTC = new Date().toISOString()
        data._last_updated_utc = nowUTC
        fs.writeFileSync(WEATHER_FILE, JSON.stringify(data, null, 2)) 

        if (!fs.existsSync(LOG_FILE)){
            fs.writeFileSync(LOG_FILE, 'timestamp,city,temperature,description\n')
            console.log('Created', LOG_FILE)

        }
        const logEntry = `${nowUTC},${city},${data.main.temp},${data.weather[0].description}\n`
        fs.appendFileSync(LOG_FILE, logEntry)



        console.log(`Weather data updated for ${city} at ${nowUTC}`)
    } catch(err){
        console.error(`Error fetching weather: ${err}`)

    }
}


fetchWeather()


