/**
 * Listings Page JavaScript
 */
(function() {
  'use strict';

  const mockProperties = [
    { id: 1, title: 'The Olive House', type: 'villa', city: 'nairobi', location: 'Karen', beds: 5, baths: 6, area: '1,180 m²', price: 145000000, currency: 'KES', img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=85', featured: true },
    { id: 2, title: 'Skyline Penthouse', type: 'penthouse', city: 'nairobi', location: 'Westlands', beds: 4, baths: 5, area: '620 m²', price: 82000000, currency: 'KES', img: 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=800&q=85', featured: true },
    { id: 3, title: 'Azure Coast Villa', type: 'villa', city: 'mombasa', location: 'Nyali', beds: 4, baths: 4, area: '840 m²', price: 96000000, currency: 'KES', img: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=85', featured: false },
    { id: 4, title: 'Ridge View Estate', type: 'villa', city: 'nairobi', location: 'Kitisuru', beds: 6, baths: 7, area: '2,100 m²', price: 220000000, currency: 'KES', img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=85', featured: true },
    { id: 5, title: 'Oceanfront Villas', type: 'villa', city: 'mombasa', location: 'Diani', beds: 5, baths: 5, area: '950 m²', price: 175000000, currency: 'KES', img: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=85', featured: false },
    { id: 6, title: 'City Heights Apartment', type: 'apartment', city: 'nairobi', location: 'Upper Hill', beds: 3, baths: 3, area: '380 m²', price: 55000000, currency: 'KES', img: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=85', featured: false },
    { id: 7, title: 'Kigali Garden Estate', type: 'townhouse', city: 'kigali', location: 'Kigali Heights', beds: 4, baths: 4, area: '720 m²', price: 89000000, currency: 'KES', img: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=85', featured: false },
    { id: 8, title: 'Dar Harbour View', type: 'apartment', city: 'dar', location: 'Dar es Salaam', beds: 3, baths: 3, area: '450 m²', price: 68000000, currency: 'KES', img: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=800&q=85', featured: false },
    { id: 9, title: 'Kampala Heights', type: 'penthouse', city: 'kampala', location: 'Kampala', beds: 4, baths: 4, area: '580 m²', price: 76000000, currency: 'KES', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=85', featured: false }
  ];

  const grid = document.getElementById('listingsGrid');
  const resultsCount = document.getElementById('resultsCount');
  const totalCount = document.getElementById('totalCount');
  const pageInfo = document.getElementById('pageInfo');
  const pagination = document.getElementById('pagination');
  let currentPage = 1;
  const perPage = 6;

  function createListingCard(property) {
    const price = ZennaraUtils.formatPrice(property.price, property.currency);
    return `
      <div class="listing-card" data-id="${property.id}">
        <div class="listing-card-img">
          <img src="${property.img}" alt="${property.title}" loading="lazy">
          <button class="listing-save" onclick="toggleSave(${property.id}, this)">♡</button>
        </div>
        <div class="listing-body">
          <div class="type">${property.type} · ${property.location}</div>
          <h3>${property.title}</h3>
          <div class="details">${property.beds} Beds · ${property.baths} Baths · ${property.area}</div>
          <div class="price">${price}</div>
        </div>
      </div>
    `;
  }

  function getFilteredProperties() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const type = document.getElementById('typeFilter').value;
    const city = document.getElementById('cityFilter').value;
    const sort = document.getElementById('sortFilter').value;

    let filtered = mockProperties.filter(p => {
      const matchSearch = p.title.toLowerCase().includes(search) || p.location.toLowerCase().includes(search);
      const matchType = !type || p.type === type;
      const matchCity = !city || p.city === city;
      return matchSearch && matchType && matchCity;
    });

    switch (sort) {
      case 'newest': filtered.sort((a, b) => b.id - a.id); break;
      case 'price_asc': filtered.sort((a, b) => a.price - b.price); break;
      case 'price_desc': filtered.sort((a, b) => b.price - a.price); break;
      default: filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return filtered;
  }

  function renderListings(page = 1) {
    currentPage = page;
    const filtered = getFilteredProperties();
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const pageItems = filtered.slice(start, end);

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="icon">🏠</div>
          <h3>No Properties Found</h3>
          <p>Try adjusting your filters or search criteria to see more results.</p>
        </div>
      `;
      resultsCount.innerHTML = '<strong>0</strong> properties found';
      totalCount.textContent = '0';
      pagination.innerHTML = '';
      return;
    }

    grid.innerHTML = pageItems.map(createListingCard).join('');
    resultsCount.innerHTML = `<strong>${filtered.length}</strong> properties found`;
    totalCount.textContent = filtered.length;

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
      pageInfo.textContent = `Page ${page} of ${totalPages}`;
    } else {
      pagination.innerHTML = '';
      pageInfo.textContent = '';
    }
  }

  window.goToPage = function(page) {
    const filtered = getFilteredProperties();
    const totalPages = Math.ceil(filtered.length / perPage);
    if (page < 1 || page > totalPages) return;
    renderListings(page);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  window.toggleSave = function(id, btn) {
    btn.classList.toggle('saved');
    btn.textContent = btn.classList.contains('saved') ? '♥' : '♡';
    ZennaraToast.show(btn.classList.contains('saved') ? 'Property saved to your collection' : 'Property removed from collection', 2500);
  };

  document.getElementById('searchBtn').addEventListener('click', function() {
    renderListings(1);
    ZennaraToast.show('Showing curated results for your search.', 3000);
  });

  document.getElementById('searchInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') document.getElementById('searchBtn').click();
  });

  renderListings(1);

})();
