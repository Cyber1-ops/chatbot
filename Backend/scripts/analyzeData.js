const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/usedCars.json');

// Read the file in chunks
const readStream = fs.createReadStream(filePath, { encoding: 'utf8' });

let buffer = '';
let count = 0;
const maxItems = 10;

readStream.on('data', (chunk) => {
    buffer += chunk;
    
    // Try to parse the buffer as JSON
    try {
        const data = JSON.parse(buffer);
        
        // Handle both array and object cases
        const items = Array.isArray(data) ? data : [data];
        
        for (const item of items) {
            if (count >= maxItems) {
                readStream.destroy();
                return;
            }
            console.log(JSON.stringify(item, null, 2));
            count++;
        }
    } catch (e) {
        // If parsing fails, continue accumulating data
        return;
    }
});

readStream.on('end', () => {
    console.log(`Displayed ${count} items`);
});

readStream.on('error', (err) => {
    console.error('Error reading file:', err);
}); 