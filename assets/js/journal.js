/**
 * Journal Page JavaScript
 */
(function() {
  'use strict';

  const posts = [
    {
      title: 'Why East Africa\'s luxury market is entering a new era',
      category: 'Market Insight',
      date: '06 Aug 2026',
      excerpt: 'A confluence of infrastructure investment, diaspora capital and a new generation of buyers is reshaping the region\'s premium property landscape.',
      img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=85'
    },
    {
      title: 'The investor\'s guide to Nairobi\'s premium neighbourhoods',
      category: 'Investment',
      date: '29 Jul 2026',
      excerpt: 'From Karen\'s leafy estates to Westlands\' urban energy, we break down the returns, lifestyle and long-term value of Nairobi\'s top addresses.',
      img: 'https://images.unsplash.com/photo-1605146769289-440113cc3d00?auto=format&fit=crop&w=800&q=85'
    },
    {
      title: 'The architecture of quiet luxury in contemporary Africa',
      category: 'Architecture',
      date: '18 Jul 2026',
      excerpt: 'How leading architects are redefining African luxury through materiality, light and a deep connection to landscape and culture.',
      img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=85'
    },
    {
      title: 'Sustainable living: The future of luxury real estate',
      category: 'Sustainability',
      date: '12 Jul 2026',
      excerpt: 'Green building certification, renewable energy integration and water conservation are becoming essential markers of premium property.',
      img: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=85'
    },
    {
      title: 'The rise of second-home markets in East Africa',
      category: 'Market Insight',
      date: '05 Jul 2026',
      excerpt: 'Coastal and lakeside retreats are attracting a new wave of buyers seeking escape, investment diversification and lifestyle flexibility.',
      img: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=85'
    },
    {
      title: 'Designing for wellness in the modern home',
      category: 'Architecture',
      date: '28 Jun 2026',
      excerpt: 'Biophilic design, natural materials and spaces that support mental and physical health are defining the next generation of luxury homes.',
      img: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=800&q=85'
    }
  ];

  const grid = document.getElementById('blogGrid');

  grid.innerHTML = posts.map(p => `
    <div class="blog-card">
      <div class="blog-card-img"><img src="${p.img}" alt="${p.title}" loading="lazy"></div>
      <div class="blog-card-body">
        <div class="meta"><span>${p.category}</span> · ${p.date}</div>
        <h3>${p.title}</h3>
        <p>${p.excerpt}</p>
        <a href="#" class="read-more">Read Story →</a>
      </div>
    </div>
  `).join('');

  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      ZennaraToast.show('You\'ve subscribed to the ZENNARA newsletter.', 4000);
      this.reset();
    });
  }

  document.querySelectorAll('.blog-pagination button:not(:disabled)').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.blog-pagination button').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      ZennaraToast.show('Loading page ' + this.textContent + '...', 2000);
    });
  });

  document.querySelectorAll('.widget ul li').forEach(item => {
    item.addEventListener('click', function() {
      const text = this.textContent.trim();
      ZennaraToast.show('Showing posts in: ' + text, 2500);
    });
  });

})();
