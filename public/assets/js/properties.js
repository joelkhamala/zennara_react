/**
 * Properties Page JavaScript
 */
(function() {
  'use strict';

  // Property Data
  const properties = [
    { id: 1, title: 'The Olive House', type: 'villa', city: 'nairobi', location: 'Karen', beds: 5, baths: 6, area: '1,180 m²', price: 145000000, currency: 'KES', img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=85', tag: 'Featured', tagType: 'gold' },
    { id: 2, title: 'Skyline Penthouse', type: 'penthouse', city: 'nairobi', location: 'Westlands', beds: 4, baths: 5, area: '620 m²', price: 82000000, currency: 'KES', img: 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=800&q=85', tag: 'New', tagType: 'new' },
    { id: 3, title: 'Azure Coast Villa', type: 'villa', city: 'mombasa', location: 'Nyali', beds: 4, baths: 4, area: '840 m²', price: 96000000, currency: 'KES', img: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=85', tag: '', tagType: '' },
    { id: 4, title: 'Ridge View Estate', type: 'villa', city: 'nairobi', location: 'Kitisuru', beds: 6, baths: 7, area: '2,100 m²', price: 220000000, currency: 'KES', img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=85', tag: 'Eco', tagType: 'eco' },
    { id: 5, title: 'Oceanfront Villas', type: 'villa', city: 'mombasa', location: 'Diani', beds: 5, baths: 5, area: '950 m²', price: 175000000, currency: 'KES', img: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=85', tag: '', tagType: '' },
    { id: 6, title: 'City Heights Apartment', type: 'apartment', city: 'nairobi', location: 'Upper Hill', beds: 3, baths: 3, area: '380 m²', price: 55000000, currency: 'KES', img: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=85', tag: '', tagType: '' },
    { id: 7, title: 'Kigali Garden Estate', type: 'townhouse', city: 'kigali', location: 'Kigali Heights', beds: 4, baths: 4, area: '720 m²', price: 89000000, currency: 'KES', img: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=85', tag: 'New', tagType: 'new' },
    { id: 8, title: 'Dar Harbour View', type: 'apartment', city: 'dar', location: 'Dar es Salaam', beds: 3, baths: 3, area: '450 m²', price: 68000000, currency: 'KES', img: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=800&q=85', tag: '', tagType: '' },
    { id: 9, title: 'Kampala Heights', type: 'penthouse', city: 'kampala', location: 'Kampala', beds: 4, baths: 4, area: '580 m²', price: 76000000, currency: 'KES', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=85', tag: 'Featured', tagType: 'gold' },
    { id: 10, title: 'The Residences at Karen', type: 'villa', city: 'nairobi', location: 'Karen', beds: 5, baths: 6, area: '1,450 m²', price: 198000000, currency: 'KES', img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=85', tag: 'Eco', tagType: 'eco' },
    { id: 11, title: 'Mombasa Beachfront', type: 'villa', city: 'mombasa', location: 'Bamburi', beds: 4, baths: 5, area: '780 m²', price: 125000000, currency: 'KES', img: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=85', tag: '', tagType: '' },
    { id: 12, title: 'Nairobi Business Centre', type: 'commercial', city: 'nairobi', location: 'Upper Hill', beds: 0, baths: 0, area: '2,500 m²', price: 350000000, currency: 'KES', img: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=85', tag: 'Commercial', tagType: 'gold' }
  ];

  const grid = document.getElementById('propertyGrid');
  const resultsCount = document.getElementById('resultsCount');
  const totalCount = document.getElementById('totalCount');
  const pagination = document.getElementById('pagination');
  let currentPage = 1;
  const perPage = 6;
  let currentView = 'grid';

  function createPropertyCard(property) {
    const price = ZennaraUtils.formatPrice(property.price, property.currency);
    const tagHTML = property.tag ? `<span class="property-tag ${property.tagType}">${property.tag}</span>` : '';
    const featuresHTML = property.beds ? `${property.beds} Beds · ${property.baths} Baths · ${property.area}` : `${property.area} · Commercial`;
    
    return `
      <div class="property-card" data-id="${property.id}">
        <div class="property-card-img">
          <img src="${property.img}" alt="${property.title}" loading="lazy">
          ${tagHTML}
          <button class="property-save" onclick="toggleSave(${property.id}, this)">♡</button>
        </div>
        <div class="property-card-body">
          <div class="location">${property.location} · ${property.city.charAt(0).toUpperCase() + property.city.slice(1)}</div>
          <h3>${property.title}</h3>
          <div class="details">${featuresHTML}</div>
          <div class="price">${price}</div>
          <div class="features">
            <span>🏠 ${property.type.charAt(0).toUpperCase() + property.type.slice(1)}</span>
            <span>📍 ${property.city.charAt(0).toUpperCase() + property.city.slice(1)}</span>
          </div>
        </div>
      </div>
    `;
  }

  function getFilteredProperties() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const type = document.getElementById('typeFilter').value;
    const city = document.getElementById('cityFilter').value;
    const budget = document.getElementById('budgetFilter').value;

    let filtered = properties.filter(p => {
      const matchSearch = p.title.toLowerCase().includes(search) || p.location.toLowerCase().includes(search) || p.city.includes(search);
      const matchType = !type || p.type === type;
      const matchCity = !city || p.city === city;
      let matchBudget = true;
      if (budget) {
        const [min, max] = budget.split('-').map(Number);
        if (max === 999999999) matchBudget = p.price >= min;
        else matchBudget = p.price >= min && p.price <= max;
      }
      return matchSearch && matchType && matchCity && matchBudget;
    });

    filtered.sort((a, b) => {
      if (a.tag === 'Featured' && b.tag !== 'Featured') return -1;
      if (b.tag === 'Featured' && a.tag !== 'Featured') return 1;
      return 0;
    });

    return filtered;
  }

  function renderProperties(page = 1) {
    currentPage = page;
    const filtered = getFilteredProperties();
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const pageItems = filtered.slice(start, end);

    resultsCount.innerHTML = `<strong>${filtered.length}</strong> properties found`;
    totalCount.textContent = filtered.length;

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="icon">🏠</div>
          <h3>No Properties Found</h3>
          <p>Try adjusting your filters or search criteria to see more results.</p>
        </div>
      `;
      pagination.innerHTML = '';
      return;
    }

    grid.innerHTML = pageItems.map(createPropertyCard).join('');
    grid.className = 'property-grid' + (currentView === 'list' ? ' list-view' : '');

    const totalPages = Math.ceil(filtered.length / perPage);
    if (totalPages > 1) {
      let paginationHTML = '';
      paginationHTML += `<button onclick="goToPage(${page - 1})" ${page === 1 ? 'disabled' : ''}>‹</button>`;
      for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
          paginationHTML += `<button class="${i === page ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
        } else if (i === page - 2 || i === page + 2) {
          paginationHTML += `<span style="padding:0 8px;color:var(--grey);">…</span>`;
        }
      }
      paginationHTML += `<button onclick="goToPage(${page + 1})" ${page === totalPages ? 'disabled' : ''}>›</button>`;
      pagination.innerHTML = paginationHTML;
    } else {
      pagination.innerHTML = '';
    }
  }

  window.goToPage = function(page) {
    const filtered = getFilteredProperties();
    const totalPages = Math.ceil(filtered.length / perPage);
    if (page < 1 || page > totalPages) return;
    renderProperties(page);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  window.toggleSave = function(id, btn) {
    btn.classList.toggle('saved');
    btn.textContent = btn.classList.contains('saved') ? '♥' : '♡';
    ZennaraToast.show(btn.classList.contains('saved') ? 'Property saved to your collection' : 'Property removed from collection', 2500);
  };

  document.getElementById('searchBtn').addEventListener('click', function() {
    renderProperties(1);
    ZennaraToast.show('Showing curated results for your search.', 3000);
  });

  document.getElementById('searchInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') document.getElementById('searchBtn').click();
  });

  document.getElementById('typeFilter').addEventListener('change', () => renderProperties(1));
  document.getElementById('cityFilter').addEventListener('change', () => renderProperties(1));
  document.getElementById('budgetFilter').addEventListener('change', () => renderProperties(1));

  document.getElementById('gridView').addEventListener('click', function() {
    currentView = 'grid';
    document.getElementById('gridView').classList.add('active');
    document.getElementById('listView').classList.remove('active');
    renderProperties(currentPage);
  });

  document.getElementById('listView').addEventListener('click', function() {
    currentView = 'list';
    document.getElementById('listView').classList.add('active');
    document.getElementById('gridView').classList.remove('active');
    renderProperties(currentPage);
  });

  renderProperties(1);

})();
