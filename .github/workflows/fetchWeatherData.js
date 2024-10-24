const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const apiKey = process.env.WEATHERLINK_API_KEY;
const apiSecret = process.env.WEATHERLINK_API_SECRET;
const stationId = process.env.WEATHERLINK_STATION_ID;

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
    const currentData = await getCurrentData(stationId, apiKey, apiSecret);

    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const dateOfExecution = now.toISOString().replace(/[:.-]/g, '');
    const fileName = `${uuidv4()}_${dateOfExecution}.json`;

    const dirPath = path.join(__dirname, 'davisdata', year.toString(), month);
    fs.mkdirSync(dirPath, { recursive: true });

    const filePath = path.join(dirPath, fileName);
    fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2));

    console.log(`File created: ${filePath}`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

storeCurrentData();
