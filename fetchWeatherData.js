const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment-timezone');

const apiKey = process.env.WEATHERLINK_API_KEY;
const apiSecret = process.env.WEATHERLINK_API_SECRET;

async function getStations(apiKey, apiSecret) {
  const url = `https://api.weatherlink.com/v2/stations?api-key=${apiKey}`;
  const headers = {
    "X-Api-Secret": apiSecret
  };

  try {
    const response = await axios.get(url, { headers });
    if (response.status === 200) {
      return response.data.stations;
    } else {
      throw new Error(`Failed to retrieve stations. Status code: ${response.status} Text: ${response.statusText}`);
    }
  } catch (error) {
    throw new Error(`Failed to retrieve stations. Error: ${error.message}`);
  }
}

async function getCurrentData(stationId, apiKey, apiSecret) {
  const url = `https://api.weatherlink.com/v2/current/${stationId}?api-key=${apiKey}`;
  const headers = {
    "X-Api-Secret": apiSecret
  };

  try {
    const response = await axios.get(url, { headers });
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Failed to retrieve current data for station. Status code: ${response.status} Text: ${response.statusText}`);
    }
  } catch (error) {
    throw new Error(`Failed to retrieve current data for station. Error: ${error.message}`);
  }
}

async function storeCurrentData() {
  try {
    const stations = await getStations(apiKey, apiSecret);
    const currentDataArray = [];

    for (const station of stations) {
      const currentData = await getCurrentData(station.station_id, apiKey, apiSecret);
      currentDataArray.push({
        station_id: station.station_id,
        data: currentData
      });
    }

    const now = moment().tz("America/Tegucigalpa");
    const year = now.year();
    const month = now.format("MM"); // Pad month to 2 digits
    const dateOfExecution = now.format("YYYYMMDD_HHmmss");
    const fileName = `${uuidv4()}_${dateOfExecution}.json`;
    const fileName = `${dateOfExecution}_${uuidv4()}.json`;

    const dirPath = path.join(__dirname, 'davisdata', year.toString(), month);
    fs.mkdirSync(dirPath, { recursive: true });

    const filePath = path.join(dirPath, fileName);
    fs.writeFileSync(filePath, JSON.stringify(currentDataArray, null, 2));

    console.log(`File created: ${filePath}`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

storeCurrentData();
