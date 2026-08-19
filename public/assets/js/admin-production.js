/* ================================================
   ZENNARA PRODUCTION ADMIN - JAVASCRIPT
   ================================================ */

// Configuration
const API_BASE_URL = 'http://localhost:8000/api';
let authToken = localStorage.getItem('admin_token');

// Current state
let currentPropertyId = null;
let propertiesData = [];

// ================================================
// INITIALIZATION
// ================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeAdmin();
});

async function initializeAdmin() {
    // Check authentication
    if (!authToken) {
        console.warn('No auth token found. Please implement login flow.');
        // For development: allow without token
        // return redirectToLogin();
    }
    
    // Load initial data
    await loadProperties();
    
    // Set up event listeners
    setupEventListeners();
}

function setupEventListeners() {
    // Search input
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 500));
    }
    
    // Filter selects
    const filterSelects = document.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
        select.addEventListener('change', handleFilterChange);
    });
}

// ================================================
// LOAD PROPERTIES
// ================================================

async function loadProperties(filters = {}) {
    try {
        showLoadingState();
        
        // Build query parameters
        const params = new URLSearchParams();
        if (filters.search) params.append('q', filters.search);
        if (filters.status) params.append('status', filters.status);
        if (filters.type) params.append('listing_type', filters.type);
        params.append('per_page', '20');
        
        // Use admin endpoint to get ALL properties
        const response = await apiCall(`/admin/properties?${params.toString()}`);
        
        if (response.success && response.data) {
            propertiesData = response.data.data || response.data;
            renderProperties(propertiesData);
        } else {
            throw new Error('Invalid API response');
        }
        
    } catch (error) {
        console.error('Error loading properties:', error);
        
        // Fallback to mock data for demo
        const mockProperties = getMockProperties();
        propertiesData = mockProperties;
        renderProperties(mockProperties);
    }
}

function getMockProperties() {
    return [
            {
                id: 1024,
                title: 'Luxury Villa in Runda Estate',
                description: '5-bedroom villa with pool and modern finishes',
                location: 'Runda, Nairobi',
                property_type: 'Villa',
                listing_type: 'sale',
                price: 85000000,
                currency: 'KES',
                bedrooms: 5,
                bathrooms: 4,
                status: 'pending_review',
                is_verified: false,
                is_featured: false,
                agent: { id: 1, name: 'John Mwangi' },
                images: [{ url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400' }],
                created_at: '2026-08-06T10:30:00Z'
            },
            {
                id: 1025,
                title: 'Modern Apartment in Kilimani',
                description: '3-bedroom apartment with city views',
                location: 'Kilimani, Nairobi',
                property_type: 'Apartment',
                listing_type: 'rent',
                price: 150000,
                currency: 'KES',
                bedrooms: 3,
                bathrooms: 2,
                status: 'verified',
                is_verified: true,
                is_featured: false,
                agent: { id: 2, name: 'Sarah Wanjiku' },
                images: [{ url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400' }],
                created_at: '2026-08-05T14:20:00Z',
                verified_at: '2026-08-06T09:15:00Z'
            },
            {
                id: 1026,
                title: 'Commercial Office Space in Westlands',
                description: 'Premium office space in Class A building',
                location: 'Westlands, Nairobi',
                property_type: 'Commercial',
                listing_type: 'rent',
                price: 500000,
                currency: 'KES',
                bedrooms: 0,
                bathrooms: 2,
                status: 'published',
                is_verified: true,
                is_featured: true,
                agent: { id: 3, name: 'Peter Omondi' },
                images: [{ url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400' }],
                created_at: '2026-08-04T11:00:00Z',
                verified_at: '2026-08-05T10:30:00Z',
                published_at: '2026-08-05T15:00:00Z'
            },
            {
                id: 1027,
                title: 'Beach House in Diani',
                description: '4-bedroom beachfront property',
                location: 'Diani Beach, Mombasa',
                property_type: 'House',
                listing_type: 'sale',
                price: 120000000,
                currency: 'KES',
                bedrooms: 4,
                bathrooms: 3,
                status: 'pending_review',
                is_verified: false,
                is_featured: false,
                agent: { id: 4, name: 'Alice Akinyi' },
                images: [{ url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400' }],
                created_at: '2026-08-07T08:00:00Z'
            },
            {
                id: 1028,
                title: 'Penthouse in Upperhill',
                description: 'Luxurious 4-bedroom penthouse with panoramic views',
                location: 'Upperhill, Nairobi',
                property_type: 'Penthouse',
                listing_type: 'sale',
                price: 95000000,
                currency: 'KES',
                bedrooms: 4,
                bathrooms: 4,
                status: 'rejected',
                is_verified: false,
                is_featured: false,
                agent: { id: 1, name: 'John Mwangi' },
                moderation_notes: 'Incomplete documentation. Please provide title deed.',
                images: [{ url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400' }],
                created_at: '2026-08-03T16:30:00Z'
            }
        ];
        
        propertiesData = mockProperties;
        renderProperties(mockProperties);
        
    } catch (error) {
        console.error('Error loading properties:', error);
        showErrorState('Failed to load properties. Please try again.');
    }
}

// ================================================
// RENDER PROPERTIES
// ================================================

function renderProperties(properties) {
    const tbody = document.getElementById('propertiesTableBody');
    
    if (properties.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <div class="empty-state-icon">
                            <i class="fas fa-inbox"></i>
                        </div>
                        <h3 class="empty-state-title">No Properties Found</h3>
                        <p class="empty-state-text">Try adjusting your filters or search query.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = properties.map(property => `
        <tr>
            <td>
                <div class="property-info">
                    <img src="${property.images[0]?.url || 'https://via.placeholder.com/80x60'}" 
                         alt="${property.title}" 
                         class="property-thumb">
                    <div class="property-details">
                        <h4>${property.title}</h4>
                        <p><i class="fas fa-map-marker-alt"></i> ${property.location}</p>
                    </div>
                </div>
            </td>
            <td>
                ${property.property_type}<br>
                <span class="text-muted" style="font-size: 12px;">
                    ${property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                </span>
            </td>
            <td>
                <strong>${formatCurrency(property.price, property.currency)}</strong><br>
                <span class="text-muted" style="font-size: 12px;">
                    ${property.bedrooms} bed • ${property.bathrooms} bath
                </span>
            </td>
            <td>
                ${getStatusBadge(property)}
            </td>
            <td>
                ${property.agent.name}
            </td>
            <td>
                ${formatDate(property.created_at)}
            </td>
            <td>
                ${getActionButtons(property)}
            </td>
        </tr>
    `).join('');
}

function getStatusBadge(property) {
    const badges = [];
    
    // Main status badge
    const statusMap = {
        'draft': 'badge-draft',
        'pending_review': 'badge-pending',
        'verified': 'badge-verified',
        'published': 'badge-published',
        'rejected': 'badge-rejected',
        'archived': 'badge-archived'
    };
    
    const statusLabels = {
        'draft': 'Draft',
        'pending_review': 'Pending Review',
        'verified': 'Verified',
        'published': 'Published',
        'rejected': 'Rejected',
        'archived': 'Archived'
    };
    
    badges.push(`<span class="badge ${statusMap[property.status]}">${statusLabels[property.status]}</span>`);
    
    // Featured badge
    if (property.is_featured) {
        badges.push('<span class="badge badge-featured">Featured</span>');
    }
    
    return badges.join(' ');
}

function getActionButtons(property) {
    const buttons = [];
    
    // View button (always available)
    buttons.push(`
        <button class="btn btn-outline btn-sm" onclick="viewProperty(${property.id})" title="View Details">
            <i class="fas fa-eye"></i>
        </button>
    `);
    
    // Status-specific actions
    if (property.status === 'pending_review') {
        buttons.push(`
            <button class="btn btn-success btn-sm" onclick="openVerificationModal(${property.id})" title="Verify">
                <i class="fas fa-check"></i>
            </button>
        `);
    }
    
    if (property.status === 'verified') {
        buttons.push(`
            <button class="btn btn-primary btn-sm" onclick="openPublishModal(${property.id})" title="Publish">
                <i class="fas fa-paper-plane"></i>
            </button>
        `);
    }
    
    if (property.status === 'published') {
        buttons.push(`
            <button class="btn btn-warning btn-sm" onclick="toggleFeature(${property.id})" title="${property.is_featured ? 'Unfeature' : 'Feature'}">
                <i class="fas fa-star"></i>
            </button>
            <button class="btn btn-outline btn-sm" onclick="archiveProperty(${property.id})" title="Archive">
                <i class="fas fa-archive"></i>
            </button>
        `);
    }
    
    return `<div class="action-buttons">${buttons.join('')}</div>`;
}

// ================================================
// PROPERTY ACTIONS
// ================================================

function viewProperty(propertyId) {
    const property = propertiesData.find(p => p.id === propertyId);
    if (!property) return;
    
    alert(`View Property: ${property.title}\n\nThis would open a detailed property view.`);
}

function openVerificationModal(propertyId) {
    currentPropertyId = propertyId;
    const property = propertiesData.find(p => p.id === propertyId);
    if (!property) return;
    
    // Populate modal
    document.getElementById('modalPropertyDetails').innerHTML = `
        <div style="margin-bottom: 20px;">
            <img src="${property.images[0]?.url || 'https://via.placeholder.com/400x300'}" 
                 alt="${property.title}"
                 style="width: 100%; height: 200px; object-fit: cover; border-radius: var(--radius-md); margin-bottom: 16px;">
            
            <h4 style="font-size: 18px; margin-bottom: 8px;">${property.title}</h4>
            <p style="color: var(--text-secondary); margin-bottom: 12px;">${property.description}</p>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 12px;">
                <div>
                    <strong>Location:</strong><br>
                    ${property.location}
                </div>
                <div>
                    <strong>Price:</strong><br>
                    ${formatCurrency(property.price, property.currency)}
                </div>
                <div>
                    <strong>Type:</strong><br>
                    ${property.property_type}
                </div>
                <div>
                    <strong>Bedrooms:</strong><br>
                    ${property.bedrooms} bed • ${property.bathrooms} bath
                </div>
            </div>
            
            <div style="padding: 12px; background: var(--bg-secondary); border-radius: var(--radius-md);">
                <strong>Agent:</strong> ${property.agent.name}<br>
                <strong>Submitted:</strong> ${formatDate(property.created_at)}
            </div>
        </div>
    `;
    
    // Clear notes
    document.getElementById('verificationNotes').value = '';
    
    // Show modal
    document.getElementById('verificationModal').classList.remove('hidden');
}

function closeVerificationModal() {
    document.getElementById('verificationModal').classList.add('hidden');
    currentPropertyId = null;
}

async function verifyProperty() {
    if (!currentPropertyId) return;
    
    const notes = document.getElementById('verificationNotes').value;
    
    try {
        // Call API
        const response = await apiCall(`/admin/properties/${currentPropertyId}/verify`, {
            method: 'POST',
            body: JSON.stringify({ notes })
        });
        
        if (response.success) {
            showNotification('Property verified successfully!', 'success');
            closeVerificationModal();
            await loadProperties();
        }
    } catch (error) {
        console.error('Error verifying property:', error);
        
        // Mock success for demo
        showNotification('Property verified successfully!', 'success');
        
        // Update local data
        const property = propertiesData.find(p => p.id === currentPropertyId);
        if (property) {
            property.status = 'verified';
            property.is_verified = true;
            property.verified_at = new Date().toISOString();
            property.moderation_notes = notes;
            renderProperties(propertiesData);
        }
        
        closeVerificationModal();
    }
}

async function rejectProperty() {
    if (!currentPropertyId) return;
    
    const notes = document.getElementById('verificationNotes').value;
    
    if (!notes.trim()) {
        showNotification('Please provide rejection notes', 'error');
        return;
    }
    
    if (!confirm('Are you sure you want to reject this property?')) return;
    
    try {
        // Call API
        const response = await apiCall(`/admin/properties/${currentPropertyId}/reject`, {
            method: 'POST',
            body: JSON.stringify({ notes })
        });
        
        if (response.success) {
            showNotification('Property rejected', 'warning');
            closeVerificationModal();
            await loadProperties();
        }
    } catch (error) {
        console.error('Error rejecting property:', error);
        
        // Mock success for demo
        showNotification('Property rejected', 'warning');
        
        // Update local data
        const property = propertiesData.find(p => p.id === currentPropertyId);
        if (property) {
            property.status = 'rejected';
            property.is_verified = false;
            property.moderation_notes = notes;
            renderProperties(propertiesData);
        }
        
        closeVerificationModal();
    }
}

function openPublishModal(propertyId) {
    currentPropertyId = propertyId;
    const property = propertiesData.find(p => p.id === propertyId);
    if (!property) return;
    
    // Reset form
    document.getElementById('featuredCheckbox').checked = property.is_featured;
    document.getElementById('expiryDate').value = '';
    
    // Show modal
    document.getElementById('publishModal').classList.remove('hidden');
}

function closePublishModal() {
    document.getElementById('publishModal').classList.add('hidden');
    currentPropertyId = null;
}

async function publishProperty() {
    if (!currentPropertyId) return;
    
    const featured = document.getElementById('featuredCheckbox').checked;
    const expiryDate = document.getElementById('expiryDate').value;
    
    try {
        // Call API
        const response = await apiCall(`/admin/properties/${currentPropertyId}/publish`, {
            method: 'POST',
            body: JSON.stringify({ featured, expires_at: expiryDate || null })
        });
        
        if (response.success) {
            showNotification('Property published successfully!', 'success');
            closePublishModal();
            await loadProperties();
        }
    } catch (error) {
        console.error('Error publishing property:', error);
        
        // Mock success for demo
        showNotification('Property published successfully!', 'success');
        
        // Update local data
        const property = propertiesData.find(p => p.id === currentPropertyId);
        if (property) {
            property.status = 'published';
            property.published_at = new Date().toISOString();
            property.is_featured = featured;
            if (expiryDate) property.expires_at = expiryDate;
            renderProperties(propertiesData);
        }
        
        closePublishModal();
    }
}

async function toggleFeature(propertyId) {
    const property = propertiesData.find(p => p.id === propertyId);
    if (!property) return;
    
    try {
        const response = await apiCall(`/admin/properties/${propertyId}/feature`, {
            method: 'POST',
            body: JSON.stringify({ featured: !property.is_featured })
        });
        
        if (response.success) {
            showNotification(
                property.is_featured ? 'Property unfeatured' : 'Property featured!',
                'success'
            );
            await loadProperties();
        }
    } catch (error) {
        console.error('Error toggling feature:', error);
        
        // Mock success for demo
        property.is_featured = !property.is_featured;
        renderProperties(propertiesData);
        showNotification(
            property.is_featured ? 'Property featured!' : 'Property unfeatured',
            'success'
        );
    }
}

async function archiveProperty(propertyId) {
    if (!confirm('Are you sure you want to archive this property?')) return;
    
    try {
        const response = await apiCall(`/admin/properties/${propertyId}/archive`, {
            method: 'POST'
        });
        
        if (response.success) {
            showNotification('Property archived', 'success');
            await loadProperties();
        }
    } catch (error) {
        console.error('Error archiving property:', error);
        
        // Mock success for demo
        const property = propertiesData.find(p => p.id === propertyId);
        if (property) {
            property.status = 'archived';
            renderProperties(propertiesData);
            showNotification('Property archived', 'success');
        }
    }
}

// ================================================
// SEARCH & FILTERS
// ================================================

function handleSearch(event) {
    const searchTerm = event.target.value;
    const filtered = propertiesData.filter(property => {
        return property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
               property.location.toLowerCase().includes(searchTerm.toLowerCase());
    });
    renderProperties(filtered);
}

function handleFilterChange() {
    const statusFilter = document.querySelectorAll('.filter-select')[0]?.value;
    const typeFilter = document.querySelectorAll('.filter-select')[1]?.value;
    
    let filtered = [...propertiesData];
    
    if (statusFilter) {
        filtered = filtered.filter(p => p.status === statusFilter);
    }
    
    if (typeFilter) {
        filtered = filtered.filter(p => p.listing_type === typeFilter);
    }
    
    renderProperties(filtered);
}

// ================================================
// API HELPERS
// ================================================

async function apiCall(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
    
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: { ...headers, ...options.headers }
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
}

// ================================================
// UI STATE HELPERS
// ================================================

function showLoadingState() {
    const tbody = document.getElementById('propertiesTableBody');
    tbody.innerHTML = `
        <tr>
            <td colspan="7" style="text-align: center; padding: 40px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: var(--primary);"></i>
                <p style="margin-top: 12px; color: var(--text-tertiary);">Loading properties...</p>
            </td>
        </tr>
    `;
}

function showErrorState(message) {
    const tbody = document.getElementById('propertiesTableBody');
    tbody.innerHTML = `
        <tr>
            <td colspan="7">
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3 class="empty-state-title">Error</h3>
                    <p class="empty-state-text">${message}</p>
                    <button class="btn btn-primary" onclick="loadProperties()">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                </div>
            </td>
        </tr>
    `;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : type === 'warning' ? 'var(--warning)' : 'var(--primary)'};
        color: white;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        animation: slideIn 0.3s;
        font-size: 14px;
        font-weight: 500;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ================================================
// UTILITY FUNCTIONS
// ================================================

function formatCurrency(amount, currency = 'KES') {
    if (currency === 'KES') {
        return 'KES ' + amount.toLocaleString('en-KE');
    } else if (currency === 'USD') {
        return '$' + amount.toLocaleString('en-US');
    }
    return currency + ' ' + amount.toLocaleString();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
