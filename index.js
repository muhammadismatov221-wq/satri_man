(function(){
  "use strict";

  const CATS = [
    {id:'all', label:'Ҳама'},
    {id:'sabzavot', label:'Сабзавот'},
    {id:'meva', label:'Мева'},
    {id:'non', label:'Нону ғалла'},
    {id:'shir', label:'Маҳсулоти шир'},
    {id:'gusht', label:'Гӯшт'},
  ];

  let products = [
    {id:1, name:'Помидори қирмизӣ', price:9, cat:'sabzavot', emoji:'🍅', fresh:true, img:''},
    {id:2, name:'Бодиринг', price:7, cat:'sabzavot', emoji:'🥒', fresh:true, img:''},
    {id:3, name:'Себи сурх', price:14, cat:'meva', emoji:'🍎', fresh:true, img:''},
    {id:4, name:'Ангур', price:18, cat:'meva', emoji:'🍇', fresh:false, img:''},
    {id:5, name:'Нони тандирӣ', price:5, cat:'non', emoji:'🍞', fresh:true, img:''},
    {id:6, name:'Гандум орд', price:22, cat:'non', emoji:'🌾', fresh:false, img:''},
    {id:7, name:'Шири тоза', price:11, cat:'shir', emoji:'🥛', fresh:true, img:''},
    {id:8, name:'Панир', price:26, cat:'shir', emoji:'🧀', fresh:false, img:''},
    {id:9, name:'Гӯшти гов', price:65, cat:'gusht', emoji:'🥩', fresh:true, img:''},
    {id:10, name:'Мурғи тоза', price:38, cat:'gusht', emoji:'🍗', fresh:true, img:''},
    {id:11, name:'Пиёз', price:4, cat:'sabzavot', emoji:'🧅', fresh:false, img:''},
    {id:12, name:'Банан', price:16, cat:'meva', emoji:'🍌', fresh:false, img:''},
  ];

  let nextId = products.length + 1;
  let activeCat = 'all';
  let cart = {}; // id -> qty

  const catNav = document.getElementById('catNav');
  const filterRow = document.getElementById('filterRow');
  const grid = document.getElementById('productGrid');
  const pCatSelect = document.getElementById('pCat');
  const statCount = document.getElementById('statCount');
  const toastEl = document.getElementById('toast');
  let toastTimer = null;

  function catLabel(id){
    const c = CATS.find(c=>c.id===id);
    return c ? c.label : id;
  }

  function renderCatNav(){
    catNav.innerHTML = CATS.map(c=>`<a href="#shop" class="pill" style="text-decoration:none; padding:8px 14px; font-size:13.5px;">${c.label}</a>`).join('');
  }

  function renderFilters(){
    filterRow.innerHTML = CATS.map(c=>
      `<button class="pill ${c.id===activeCat?'active':''}" data-cat="${c.id}">${c.label}</button>`
    ).join('');
    filterRow.querySelectorAll('button').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        activeCat = btn.getAttribute('data-cat');
        renderFilters();
        renderGrid();
      });
    });
  }

  function renderCatOptions(){
    pCatSelect.innerHTML = CATS.filter(c=>c.id!=='all').map(c=>`<option value="${c.id}">${c.label}</option>`).join('');
  }

  function mediaHtml(p){
    if(p.img){
      return `<img src="${escapeAttr(p.img)}" alt="${escapeAttr(p.name)}" onerror="this.parentElement.innerHTML='${p.emoji||'🛒'}'">`;
    }
    return p.emoji || '🛒';
  }

  function escapeAttr(s){
    return String(s).replace(/"/g,'&quot;');
  }
  function escapeHtml(s){
    return String(s).replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  }

  function renderGrid(){
    const list = activeCat==='all' ? products : products.filter(p=>p.cat===activeCat);
    if(list.length===0){
      grid.innerHTML = `<div class="empty-note">Дар ин категория ҳанӯз маҳсулот нест.</div>`;
      return;
    }
    grid.innerHTML = list.map(p=>`
      <div class="card">
        <div class="card-media">
          ${p.fresh?'<span class="badge-fresh">Тоза</span>':''}
          ${mediaHtml(p)}
        </div>
        <div class="card-body">
          <span class="card-cat">${catLabel(p.cat)}</span>
          <span class="card-name">${escapeHtml(p.name)}</span>
          <div class="card-foot">
            <span class="tag-price">${p.price} с.</span>
            <button class="add-btn" data-id="${p.id}" aria-label="Ба сабад илова кардан">+</button>
          </div>
        </div>
      </div>
    `).join('');
    grid.querySelectorAll('.add-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = Number(btn.getAttribute('data-id'));
        addToCart(id);
      });
    });
    statCount.textContent = products.length;
  }

  function addToCart(id){
    cart[id] = (cart[id]||0) + 1;
    renderCartCount();
    renderCartBody();
    const p = products.find(p=>p.id===id);
    showToast(`${p.emoji||''} ${p.name} ба сабад илова шуд`);
  }

  function changeQty(id, delta){
    if(!cart[id]) return;
    cart[id] += delta;
    if(cart[id]<=0) delete cart[id];
    renderCartCount();
    renderCartBody();
  }

  function removeFromCart(id){
    delete cart[id];
    renderCartCount();
    renderCartBody();
  }

  function renderCartCount(){
    const count = Object.values(cart).reduce((a,b)=>a+b,0);
    document.getElementById('cartCount').textContent = count;
  }

  function renderCartBody(){
    const body = document.getElementById('cartBody');
    const ids = Object.keys(cart);
    if(ids.length===0){
      body.innerHTML = `<div class="cart-empty">Сабади шумо холист.<br>Маҳсулоти дилхоҳро илова кунед.</div>`;
      document.getElementById('cartTotal').textContent = '0 сомонӣ';
      return;
    }
    let total = 0;
    body.innerHTML = ids.map(idStr=>{
      const id = Number(idStr);
      const p = products.find(p=>p.id===id);
      if(!p) return '';
      const qty = cart[id];
      const lineTotal = p.price*qty;
      total += lineTotal;
      return `
        <div class="cart-item">
          <div class="thumb">${mediaHtml(p)}</div>
          <div class="info">
            <b>${escapeHtml(p.name)}</b>
            <span class="mono" style="font-size:13px; color:#6b5a5e;">${p.price} с. × ${qty} = ${lineTotal} с.</span>
            <div class="qty-row">
              <button class="qty-btn" data-id="${id}" data-d="-1">−</button>
              <span class="qty-val">${qty}</span>
              <button class="qty-btn" data-id="${id}" data-d="1">+</button>
              <button class="remove-link" data-id="${id}">Хориҷ кардан</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
    document.getElementById('cartTotal').textContent = total + ' сомонӣ';

    body.querySelectorAll('.qty-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        changeQty(Number(btn.getAttribute('data-id')), Number(btn.getAttribute('data-d')));
      });
    });
    body.querySelectorAll('.remove-link').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        removeFromCart(Number(btn.getAttribute('data-id')));
      });
    });
  }

  function showToast(msg){
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=> toastEl.classList.remove('show'), 2200);
  }

  // ---- drawer open/close ----
  const overlay = document.getElementById('overlay');
  const drawer = document.getElementById('drawer');
  function openDrawer(){
    overlay.classList.add('show');
    drawer.classList.add('show');
  }
  function closeDrawer(){
    overlay.classList.remove('show');
    drawer.classList.remove('show');
  }
  document.getElementById('openCart').addEventListener('click', openDrawer);
  document.getElementById('closeCart').addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  document.getElementById('checkoutBtn').addEventListener('click', ()=>{
    const count = Object.values(cart).reduce((a,b)=>a+b,0);
    if(count===0){ showToast('Сабади шумо холист'); return; }
    cart = {};
    renderCartCount();
    renderCartBody();
    closeDrawer();
    showToast('Фармоиши шумо қабул шуд. Ташаккур!');
  });

  // ---- admin: add product ----
  document.getElementById('addProductBtn').addEventListener('click', ()=>{
    const nameEl = document.getElementById('pName');
    const priceEl = document.getElementById('pPrice');
    const emojiEl = document.getElementById('pEmoji');
    const imgEl = document.getElementById('pImg');
    const msg = document.getElementById('adminMsg');

    const name = nameEl.value.trim();
    const price = parseFloat(priceEl.value);
    const cat = pCatSelect.value;
    const emoji = emojiEl.value.trim() || '🛒';
    const img = imgEl.value.trim();

    if(!name || isNaN(price) || price<=0){
      msg.textContent = 'Лутфан ном ва нархи дурустро ворид кунед.';
      msg.style.color = '#ffb0b0';
      return;
    }

    products.unshift({id:nextId++, name, price, cat, emoji, fresh:true, img});
    activeCat = 'all';
    renderFilters();
    renderGrid();

    nameEl.value=''; priceEl.value=''; emojiEl.value=''; imgEl.value='';
    msg.textContent = `«${name}» бо муваффақият илова шуд!`;
    msg.style.color = '#c8f0b0';
    showToast(`✅ ${emoji} ${name} ба фурӯшгоҳ илова шуд`);

    setTimeout(()=>{ msg.textContent='Ҳама майдонҳоро пур кунед.'; msg.style.color='#c9b7c0'; }, 3500);
  });

  // ---- init ----
  renderCatNav();
  renderFilters();
  renderCatOptions();
  renderGrid();
  renderCartCount();
  renderCartBody();
})();