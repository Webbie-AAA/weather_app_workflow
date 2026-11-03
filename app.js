import express from 'express'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
const PORT = process.env.PORT 

const DATA_DIR = path.join(import.meta.dirname, 'data')
const WEATHER_FILE = path.join(DATA_DIR, 'weather.json')
const LOG_FILE = path.join(DATA_DIR, 'weather_log.csv')

app.use(express.static(path.join(import.meta.dirname, 'public')))

app.get('/api/weather', (req,res) => {
    try {
        const weatherData = JSON.parse(fs.readFileSync(WEATHER_FILE, 'utf-8'))
        res.json(weatherData)
    } catch {
        res.status(404).json({error: 'No weather data available'})
    }
})

app.get('/api/weather-log', (req, res)=>{
    try {
        //reading csv file and split it into string of lines and saving it in that variable
        const lines = fs.readFileSync(LOG_FILE, 'utf-8').trim().split('\n')
        const timestamps = []
        const temps = []
        //slice 1 will skip the headers (i.e. names of the values)
        for (const line of lines.slice(1)){
            //we pass 2 values, with line .split() add a comma, it will split each line into its individual values
            //The square bracket deconstruct the values, 
            const [timestamp, , temperature] = line.split(',')
            //Make sure that both of them exist from where we grab the file
            //timestamp of data and hour and the other just the temperature
            //Second was the parse float. 
            if (timestamp && temperature){
                timestamps.push(timestamp)
                temps.push(parseFloat(temperature))
            }
        }
        //then we send back both arrays
        res.json({timestamps, temps})
    } catch {
        res.status(404).json({error: 'No weather log available'})
    }
})

app.listen(PORT, ()=>{
    console.log(`Server running on PORT: ${PORT}`)
})