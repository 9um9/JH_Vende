// ...standalone script...
(function(){
  const WA_NUMBER = '5534997172028';
  const productGrid = document.getElementById('productGrid');
  const searchBox = document.getElementById('searchBox');
  const sortSelect = document.getElementById('sortSelect');
  const applyFiltersBtn = document.getElementById('applyFiltersBtn');
  const resetFiltersBtn = document.getElementById('resetFilters');
  const resultsCount = document.getElementById('resultsCount');
  const noResults = document.getElementById('noResults');

  const categoryCheckboxes = Array.from(document.querySelectorAll('.category-filter'));
  const conditionCheckboxes = Array.from(document.querySelectorAll('.condition-filter'));
  const brandCheckboxes = Array.from(document.querySelectorAll('.brand-filter'));
  const priceMin = document.getElementById('priceMin');
  const priceMax = document.getElementById('priceMax');
  const onlyInStock = document.getElementById('onlyInStock');

  const PRODUCTS = [
    { id: 'P0001', title:'Asus RTX 2060 ROG Strix', category:'GPU', brand:'Asus', condition:'Seminovo', price:1299.84, inStock:true, img:'https://m.media-amazon.com/images/I/61nHx0+pAIL.jpg' },
    { id: 'P0002', title:'Adaptador VGA -> HDMI', category:'Adaptador', brand:'Generic', condition:'Novo', price:45.77, inStock:true, img:'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSWzWDD...' },
    { id: 'P0003', title:'Adaptador Wifi USB 1300mbps', category:'Adaptador', brand:'Generic', condition:'Novo', price:75.00, inStock:false, img:'' },
    { id: 'P0004', title:'Redmi Note 12 256GB', category:'Celular', brand:'Redmi', condition:'Novo', price:850.00, inStock:true, img:'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTYieo...' },
    { id: 'P0005', title:'AMD Asus ROG Strix B450-F', category:'PlacaMãe', brand:'Asus', condition:'Seminovo', price:893.30, inStock:true, img:'https://images6.kabum.com.br/produtos/fotos/97706/97706_2_1533576970_gg.jpg' },
    { id: 'P0006', title:'Ryzen 5 5500 4.2GHz', category:'Processador', brand:'AMD', condition:'Novo', price:475.49, inStock:true, img:'' },
    { id: 'P0007', title:'Ryzen 5 5600 4.4GHz', category:'Processador', brand:'AMD', condition:'Seminovo', price:655.71, inStock:false, img:'' },
    { id: 'P0008', title:'Monitor Gamer 24" 144Hz', category:'Monitor', brand:'Generic', condition:'Novo', price:999.99, inStock:true, img:'' },
    { id: 'P0009', title:'Fonte Gamer 650W', category:'Fonte', brand:'Generic', condition:'Novo', price:289.50, inStock:true, img:'' },
    { id: 'P0010', title:'SSD NVMe 1TB', category:'Storage', brand:'Generic', condition:'Novo', price:429.00, inStock:true, img:'' },
    { id: 'P0011', title:'Placa de Som Externa', category:'PlacaMãe', brand:'Generic', condition:'Seminovo', price:99.99, inStock:true, img:'' },
    { id: 'P0012', title:'Cooler CPU RGB', category:'Cooler', brand:'Generic', condition:'Novo', price:149.00, inStock:true, img:'' }
  ];

  // Helpers
  function formatPrice(n){ return isFinite(n) ? `R$ ${n.toFixed(2).replace('.',',')}` : '—'; }
  function sanitize(str){ return (str||'').toString().replace(/[<>]/g, ''); }

  function buildCard(p){
    const card = document.createElement('article');
    card.className = 'product-card';
    card.setAttribute('data-id', p.id);
    card.setAttribute('data-category', p.category);
    card.setAttribute('data-price', p.price);
    card.setAttribute('data-condition', p.condition);
    card.setAttribute('data-brand', p.brand);
    card.innerHTML = `
      <div class="id">${p.id}</div>
      <img src="${p.img || 'https://via.placeholder.com/400x300?text=Sem+Imagem'}" alt="${sanitize(p.title)}" />
      <h2>${sanitize(p.title)}</h2>
      <p class="desc">${sanitize(p.brand)} • ${sanitize(p.category)} • ${sanitize(p.condition)}</p>
      <p class="price">${formatPrice(p.price)}</p>
      <div class="product-actions">
        <a class="pill" href="https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Olá, tenho interesse no produto ' + p.id + ' - ' + p.title)}" target="_blank">WhatsApp</a>
        <button class="pill addCompare">Adicionar</button>
        <span class="pill">${p.inStock ? 'Em estoque' : 'Fora de estoque'}</span>
      </div>
    `;
    return card;
  }

  function renderProducts(list){
    productGrid.innerHTML = '';
    if(!list || list.length === 0){
      noResults.style.display = 'block';
      resultsCount.textContent = 0;
      return;
    }
    noResults.style.display = 'none';
    const frag = document.createDocumentFragment();
    list.forEach(p => frag.appendChild(buildCard(p)));
    productGrid.appendChild(frag);
    resultsCount.textContent = list.length;
  }

  function getCheckedValues(checkboxes){
    return checkboxes.filter(c => c.checked).map(c => c.value);
  }

  function applyFilters(){
    const query = (searchBox.value||'').toLowerCase().trim();
    const catChecked = getCheckedValues(categoryCheckboxes);
    const condChecked = getCheckedValues(conditionCheckboxes);
    const brandChecked = getCheckedValues(brandCheckboxes);
    const min = parseFloat(priceMin.value) || Number.NEGATIVE_INFINITY;
    const max = parseFloat(priceMax.value) || Number.POSITIVE_INFINITY;
    const onlyStock = onlyInStock.checked;
    let list = PRODUCTS.filter(p => {
      // category filter
      if(catChecked.length && !catChecked.includes(p.category)) return false;
      if(condChecked.length && !condChecked.includes(p.condition)) return false;
      if(brandChecked.length && !brandChecked.includes(p.brand)) return false;
      if(onlyStock && !p.inStock) return false;
      if(p.price < min || p.price > max) return false;
      if(!query) return true;
      // search by id, title, brand, category
      const token = query.toLowerCase();
      if(p.id.toLowerCase().includes(token)) return true;
      if(p.title.toLowerCase().includes(token)) return true;
      if((p.brand||'').toLowerCase().includes(token)) return true;
      if((p.category||'').toLowerCase().includes(token)) return true;
      return false;
    });

    // sorting
    const sort = sortSelect.value;
    if(sort === 'price-asc'){
      list.sort((a,b)=>a.price - b.price);
    }else if(sort === 'price-desc'){
      list.sort((a,b)=>b.price - a.price);
    }else if(sort === 'id-desc'){
      list.sort((a,b)=> parseInt(b.id.replace(/\D/g,'')) - parseInt(a.id.replace(/\D/g,'')));
    } // else relevance or default
    renderProducts(list);
  }

  // attach events
  applyFiltersBtn.addEventListener('click', applyFilters);
  searchBox.addEventListener('input', () => {
    // debounced for performance
    if(window._searchDebounce) clearTimeout(window._searchDebounce);
    window._searchDebounce = setTimeout(() => applyFilters(), 220);
  });
  sortSelect.addEventListener('change', applyFilters);
  categoryCheckboxes.forEach(c => c.addEventListener('change', applyFilters));
  conditionCheckboxes.forEach(c => c.addEventListener('change', applyFilters));
  brandCheckboxes.forEach(c => c.addEventListener('change', applyFilters));
  priceMin.addEventListener('change', applyFilters);
  priceMax.addEventListener('change', applyFilters);
  onlyInStock && onlyInStock.addEventListener('change', applyFilters);

  // reset button
  resetFiltersBtn.addEventListener('click', ()=>{
    categoryCheckboxes.forEach(c=>c.checked=false);
    conditionCheckboxes.forEach(c=>c.checked=false);
    brandCheckboxes.forEach(c=>c.checked=false);
    priceMin.value = '';
    priceMax.value = '';
    onlyInStock.checked = false;
    searchBox.value = '';
    sortSelect.value = 'relevance';
    applyFilters();
  });

  // prefilter via querystring: ?cat=GPU
  (function prefilterFromQS(){
    const qs = new URLSearchParams(location.search);
    const cat = qs.get('cat');
    if(cat){
      categoryCheckboxes.forEach(c => { if(c.value.toLowerCase() === cat.toLowerCase()) c.checked = true; });
    }
    const q = qs.get('q');
    if(q) searchBox.value = q;
  })();

  // initial render
  renderProducts(PRODUCTS);
  // apply filters on load (if qs provided)
  applyFilters();
})();
