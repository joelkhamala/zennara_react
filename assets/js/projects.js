/**
 * Projects Page JavaScript
 */
(function() {
  'use strict';

  const projects = [
    { id: 1, title: 'The Residence at Karen', status: 'pre-launch', city: 'nairobi', location: 'Karen, Nairobi', units: '12 Villas', completion: '2027', description: 'A private enclave of contemporary villas set in 8 acres of landscaped gardens with panoramic views of the Ngong Hills.', img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=85' },
    { id: 2, title: 'Oceanfront Collection', status: 'selling', city: 'mombasa', location: 'Diani, Mombasa', units: '8 Villas', completion: '2026', description: 'Beachfront villas designed for indoor-outdoor living with direct access to the Indian Ocean and private infinity pools.', img: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=85' },
    { id: 3, title: 'Nairobi Business Park', status: 'investment', city: 'nairobi', location: 'Upper Hill, Nairobi', units: 'Commercial', completion: '2028', description: 'A premium commercial development in Nairobi\'s financial district offering Grade A office space with sustainability certifications.', img: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=85' },
    { id: 4, title: 'Kigali Heights', status: 'pre-launch', city: 'kigali', location: 'Kigali, Rwanda', units: '24 Apartments', completion: '2027', description: 'Contemporary apartments in Kigali\'s most desirable neighbourhood, designed with wellness and community at the forefront.', img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=85' },
    { id: 5, title: 'Zanzibar Beach Estate', status: 'selling', city: 'zanzibar', location: 'Zanzibar, Tanzania', units: '15 Villas', completion: '2026', description: 'An exclusive beachfront development on the pristine shores of Zanzibar, blending Swahili architecture with modern luxury.', img: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=85' },
    { id: 6, title: 'Kampala Garden City', status: 'investment', city: 'kampala', location: 'Kampala, Uganda', units: 'Mixed-Use', completion: '2029', description: 'A landmark mixed-use development combining residential, retail and office spaces in Kampala\'s emerging business district.', img: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=85' },
    { id: 7, title: 'Dar Harbour Residences', status: 'pre-launch', city: 'dar', location: 'Dar es Salaam, Tanzania', units: '18 Apartments', completion: '2027', description: 'Waterfront residences offering panoramic harbour views with world-class amenities including a rooftop infinity pool and fitness centre.', img: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=800&q=85' },
    { id: 8, title: 'Karen Ridge Estate', status: 'completed', city: 'nairobi', location: 'Karen, Nairobi', units: '9 Villas', completion: '2024', description: 'An award-winning development of luxury villas that redefines modern African architecture with sustainable materials and timeless design.', img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=85' }
  ];

  const grid = document.getElementById('projectGrid');
  const resultsCount = document.getElementById('resultsCount');
  const totalCount = document.getElementById('totalCount');

  function getStatusLabel(status) {
    const labels = {
      'pre-launch': 'Pre-launch',
      'selling': 'Now Selling',
      'investment': 'Investment',
      'completed': 'Completed'
    };
    return labels[status] || status;
  }

  function createProjectCard(project) {
    return `
      <div class="project-card" data-id="${project.id}">
        <div class="project-card-img">
          <img src="${project.img}" alt="${project.title}" loading="lazy">
          <span class="project-status ${project.status}">${getStatusLabel(project.status)}</span>
          <button class="project-save" onclick="toggleSave(${project.id}, this)">♡</button>
        </div>
        <div class="project-card-body">
          <div class="location">${project.location}</div>
          <h3>${project.title}</h3>
          <div class="description">${project.description}</div>
          <div class="project-meta">
            <span>🏠 <strong>${project.units}</strong></span>
            <span>📅 <strong>${project.completion}</strong></span>
            <span>📍 <strong>${project.city.charAt(0).toUpperCase() + project.city.slice(1)}</strong></span>
          </div>
        </div>
      </div>
    `;
  }

  function getFilteredProjects() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const status = document.getElementById('statusFilter').value;
    const city = document.getElementById('cityFilter').value;

    return projects.filter(p => {
      const matchSearch = p.title.toLowerCase().includes(search) || p.location.toLowerCase().includes(search);
      const matchStatus = !status || p.status === status;
      const matchCity = !city || p.city === city;
      return matchSearch && matchStatus && matchCity;
    });
  }

  function renderProjects() {
    const filtered = getFilteredProjects();
    resultsCount.innerHTML = `<strong>${filtered.length}</strong> projects found`;
    totalCount.textContent = filtered.length;

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="icon">🏗️</div>
          <h3>No Projects Found</h3>
          <p>Try adjusting your filters or search criteria to see more results.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(createProjectCard).join('');
  }

  window.toggleSave = function(id, btn) {
    btn.classList.toggle('saved');
    btn.textContent = btn.classList.contains('saved') ? '♥' : '♡';
    ZennaraToast.show(btn.classList.contains('saved') ? 'Project saved to your collection' : 'Project removed from collection', 2500);
  };

  document.getElementById('searchBtn').addEventListener('click', function() {
    renderProjects();
    ZennaraToast.show('Showing curated projects for your search.', 3000);
  });

  document.getElementById('searchInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') document.getElementById('searchBtn').click();
  });

  document.getElementById('statusFilter').addEventListener('change', renderProjects);
  document.getElementById('cityFilter').addEventListener('change', renderProjects);

  renderProjects();

})();
