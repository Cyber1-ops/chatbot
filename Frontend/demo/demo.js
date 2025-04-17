let currentPage = 1;
const itemsPerPage = 6;
let currentData = [];
let filteredData = [];
let highlightedCarIndex = null;

fetch("../../Backend/data/usedCars.json")
  .then(res => res.json())
  .then(data => {
    currentData = data;
    filteredData = data;

    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    const carParam = urlParams.get('car');

    if (carParam !== null && !isNaN(parseInt(carParam))) {
      highlightedCarIndex = parseInt(carParam);
      currentPage = Math.floor(highlightedCarIndex / itemsPerPage) + 1;
    } else if (pageParam && !isNaN(parseInt(pageParam))) {
      currentPage = parseInt(pageParam);
    }

    // Clean the URL
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);

    displayPage(currentPage, filteredData);
  });

// Display a specific page
function displayPage(page, dataSet) {
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedCars = dataSet.slice(start, end);

  displayCars(paginatedCars, start);
  renderPagination(dataSet.length, page);
}

// Display car cards
function displayCars(cars, startIndex) {
  const container = document.getElementById('carContainer');
  container.innerHTML = '';

  if (cars.length === 0) {
    container.innerHTML = '<p>No cars found.</p>';
    return;
  }

  cars.forEach((car, index) => {
    const absoluteIndex = currentData.indexOf(car);
    const isHighlighted = absoluteIndex === highlightedCarIndex;

    const card = document.createElement('div');
    card.className = 'col-md-4 mb-4';
    card.id = `car${absoluteIndex}`;

    card.innerHTML = `
      <div class="card h-100 shadow-sm ${isHighlighted ? 'highlighted-car' : ''}">
        <div class="card-body">
          <h5 class="card-title">${car["Manufacturer"]} ${car["Brand"]}</h5>
          <h6 class="card-subtitle mb-2 text-muted">${car["Model Year"]} | ${car["Body Type"]}</h6>
          <p class="card-text">
            <strong>Cost:</strong> $${car["Approx Cost"]}k<br>
            <strong>Origin:</strong> ${car["Origin Country"]}<br>
            <strong>Fuel Efficiency:</strong> ${car["Fuel Econ (km/L)"]} km/L<br>
            <strong>Top Speed:</strong> ${car["Top speed (kph)"]} kph<br>
          </p>
          <details>
            <summary>More Details</summary>
            <p>${car["Overview"].slice(0, 300)}...</p>
          </details>
        </div>
      </div>
    `;

    container.appendChild(card);

    if (isHighlighted) {
      setTimeout(() => {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  });
}

// Render pagination
function renderPagination(totalItems, currentPage) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';

  if (totalPages <= 1) return;

  const createPageItem = (label, page = null, isDisabled = false, isActive = false) => {
    const li = document.createElement('li');
    li.className = `page-item ${isDisabled ? 'disabled' : ''} ${isActive ? 'active' : ''}`;
    const a = document.createElement('a');
    a.className = 'page-link';
    a.href = '#';
    a.textContent = label;
    if (!isDisabled && page !== null) {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        setPage(page);
      });
    }
    li.appendChild(a);
    return li;
  };

  // Previous button
  pagination.appendChild(createPageItem('Previous', currentPage - 1, currentPage === 1));

  const maxVisible = 5;
  let startPage = 1;
  let endPage = totalPages;

  if (totalPages > maxVisible) {
    if (currentPage <= 3) {
      endPage = maxVisible;
    } else if (currentPage >= totalPages - 2) {
      startPage = totalPages - maxVisible + 1;
    } else {
      startPage = currentPage - 2;
      endPage = currentPage + 2;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pagination.appendChild(createPageItem(i, i, false, currentPage === i));
  }

  if (endPage < totalPages) {
    const dots = document.createElement('li');
    dots.className = 'page-item disabled';
    dots.innerHTML = `<span class="page-link">...</span>`;
    pagination.appendChild(dots);
    pagination.appendChild(createPageItem(totalPages, totalPages, false, currentPage === totalPages));
  }

  // Next button
  pagination.appendChild(createPageItem('Next', currentPage + 1, currentPage === totalPages));
}

// Public: Set page programmatically
function setPage(pageNumber) {
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  if (pageNumber < 1 || pageNumber > totalPages) return;
  currentPage = pageNumber;
  displayPage(currentPage, filteredData);
}

// Public: Set highlighted car index
function setCarIndex(index) {
  if (index < 0 || index >= currentData.length) return;
  highlightedCarIndex = index;
  currentPage = Math.floor(index / itemsPerPage) + 1;
  displayPage(currentPage, filteredData);
}

function getPageFromIndex(index) {
  if (index < 0) return 1;
  return Math.floor(index / itemsPerPage) + 1;
}