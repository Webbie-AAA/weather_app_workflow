const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(process.cwd(), 'data') 
const JSON_FILE = path.join(DATA_DIR, 'weather.json')
const CSV_FILE = path.join(DATA_DIR, 'weather_log.csv')

describe('Weather Data tests', ()=>{
    test('Weather.json exists', ()=>{
        expect(fs.existsSync(JSON_FILE)).toBe(true)
    })

    test('weather.json has required keys', ()=>{
        const raw = fs.readFileSync(JSON_FILE, 'utf-8')
        expect(raw.trim().length).toBeGreaterThan(0)

        const data = JSON.parse(raw)
        expect(data).toHaveProperty('main')
        expect(data).toHaveProperty('weather')
        expect(data.weather[0]).toHaveProperty('description')
        expect(data).toHaveProperty('_last_updated_utc')

        expect(new Date(data._last_updated_utc).toISOString()).toBe(data._last_updated_utc)
    })

    test('weather.json is returning London weather', ()=>{
        const raw = fs.readFileSync(JSON_FILE, 'utf-8')
        const data = JSON.parse(raw)
        expect(data).toHaveProperty('name', 'London')
        

    })

    test('weather_log.csv and has header', ()=>{
        expect(fs.existsSync(CSV_FILE)).toBe(true)

        const csvContent = fs.readFileSync(CSV_FILE, 'utf-8')
        const lines = csvContent.trim().split('\n')
        const header = lines[0].split(',')

        expect(header).toEqual(['timestamp', 'city', 'temperature', 'description'])
        expect(lines.length).toBeGreaterThan(1)

        const firstDataRow = lines[1].split(',')
        expect(!isNaN(parseFloat(firstDataRow[2]))).toBe(true)
    
    })

    test('weather_log.csv is returning London weather', ()=>{
        const csvContent = fs.readFileSync(CSV_FILE, 'utf-8').trim().split('\n')
        const values = csvContent[1].split(',')

        expect(values[1]).toBe('London')
        

    })

})

