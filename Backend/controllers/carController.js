const cars = require('../usedCars.json');

// /api/cars/search?make=Toyota&model=Corolla&year=2018&max_price=50000
exports.searchCars = (req, res) => {
  const { make, model, year, max_price } = req.query;

  const results = cars.filter(car => {
    return (!make || car.make.toLowerCase() === make.toLowerCase()) &&
           (!model || car.model.toLowerCase() === model.toLowerCase()) &&
           (!year || parseInt(car.year) === parseInt(year)) &&
           (!max_price || parseFloat(car.price) <= parseFloat(max_price));
  });

  res.json(results);
};

// Simple recommendation logic
// /api/cars/recommend?type=SUV&budget=60000
exports.recommendCars = (req, res) => {
  const { type, budget } = req.query;

  const results = cars.filter(car => {
    return (!type || (car.bodyType && car.bodyType.toLowerCase().includes(type.toLowerCase()))) &&
           (!budget || parseFloat(car.price) <= parseFloat(budget));
  });

  res.json(results.slice(0, 5)); // Return top 5 matches
};
