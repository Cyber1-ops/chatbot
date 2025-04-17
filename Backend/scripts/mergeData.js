const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// File paths
const newCsvPath = path.join(__dirname, '../data/uae_used_cars_10k.csv');
const existingJsonPath = path.join(__dirname, '../data/usedCars.json');
const outputJsonPath = path.join(__dirname, '../data/usedCars_merged.json');

// Read existing JSON data
const existingData = JSON.parse(fs.readFileSync(existingJsonPath, 'utf8'));
const newData = [];

// Process new CSV data
fs.createReadStream(newCsvPath)
  .pipe(csv())
  .on('data', (row) => {
    // Transform CSV row to match existing JSON structure
    const car = {
      make: row.Make,
      model: row.Model,
      year: parseInt(row.Year),
      price: parseFloat(row.Price),
      mileage: parseFloat(row.Mileage),
      bodyType: row['Body Type'],
      fuelType: row['Fuel Type'],
      transmission: row.Transmission,
      features: extractFeatures(row.Description),
      highlights: [
        `Color: ${row.Color}`,
        `Location: ${row.Location}`,
        row.Description.split('Condition:')[0].trim()
      ]
    };
    newData.push(car);
  })
  .on('end', () => {
    // Merge data
    const mergedData = [...existingData, ...newData];
    
    // Remove duplicates based on make, model, year, and price
    const uniqueData = removeDuplicates(mergedData);
    
    // Write merged data to new file
    fs.writeFileSync(outputJsonPath, JSON.stringify(uniqueData, null, 2));
    console.log(`Successfully merged data. Total unique cars: ${uniqueData.length}`);
  });

// Helper function to extract features from description
function extractFeatures(description) {
  const features = [];
  if (description.includes('Rear camera')) features.push('Rear Camera');
  if (description.includes('Leather seats')) features.push('Leather Seats');
  if (description.includes('Sunroof')) features.push('Sunroof');
  if (description.includes('Bluetooth')) features.push('Bluetooth');
  if (description.includes('Adaptive cruise control')) features.push('Adaptive Cruise Control');
  return features;
}

// Helper function to remove duplicates
function removeDuplicates(cars) {
  const unique = new Map();
  cars.forEach(car => {
    const key = `${car.make}-${car.model}-${car.year}-${car.price}`;
    if (!unique.has(key)) {
      unique.set(key, car);
    }
  });
  return Array.from(unique.values());
} 