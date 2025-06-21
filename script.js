document.addEventListener('DOMContentLoaded', () => {

    const sitePages = [
        { id: 'chenqingbiao', title: '陈情表', author: '[晋] 李密', url: 'chenqingbiao.html', description: '被誉为"千古第一表"，以其至诚至孝的情感，成为中国古代抒情散文的典范之作。', keywords: 'chenqingbiao 陈情表 李密 limi 晋 孝 奏表' },
        { id: 'xiangjixuanzhi', title: '项脊轩志', author: '[明] 归有光', url: 'xiangjixuanzhi.html', description: '明代散文的典范，以一座小小书斋为线索，串联起家族的衰落与人事的变迁，文末的枇杷树更是点睛之笔。', keywords: 'xiangjixuanzhi 项脊轩志 归有光 guiyouguang 明 散文 枇杷树' },
        { id: 'placeholder1', title: '待填之作', author: '[朝代] 作者', url: '#', description: '此处为预留卡片，用于展示未来的新文章。您可以根据模板添加更多精彩内容。', keywords: '示例 placeholder' }
    ];

    // --- Canvas Starfield Initialization ---
    const canvas = document.getElementById('starfield');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        const stars = [];
        const numStars = window.innerWidth > 768 ? 400 : 150; 
        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.2,
                speed: Math.random() * 0.5 + 0.1 
            });
        }
        function drawStars() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            stars.forEach(star => {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fill();
                star.y += star.speed;
                if (star.y > canvas.height) {
                    star.y = 0;
                    star.x = Math.random() * canvas.width;
                }
            });
            requestAnimationFrame(drawStars);
        }
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            drawStars();
        }
    }

    // --- [优化] 将非关键JS延迟执行 ---
    function deferredSetup() {
        const articleGrid = document.getElementById('article-grid');
        if (articleGrid) {
            const pagesToDisplay = sitePages.filter(page => page.id !== 'placeholder1');
            const fragment = document.createDocumentFragment(); // 使用文档片段优化批量DOM插入
            pagesToDisplay.forEach((page, index) => {
                const card = document.createElement('a');
                card.href = page.url;
                card.className = 'article-card animated-item';
                card.style.animationDelay = `${index * 100 + 200}ms`;
                card.innerHTML = `<h3>${page.title}</h3><div class="author">${page.author}</div><p>${page.description}</p><div class="read-more">阅读全文 →</div>`;
                fragment.appendChild(card);
            });
            articleGrid.appendChild(fragment); // 一次性插入所有卡片
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -80px 0px' });
        document.querySelectorAll('.animated-item, #search-section').forEach(el => observer.observe(el));
    }

    if ('requestIdleCallback' in window) {
        requestIdleCallback(deferredSetup);
    } else {
        setTimeout(deferredSetup, 200); // 为不支持的浏览器提供回退
    }

    // --- 立即执行的关键JS ---
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) { header.classList.add('scrolled'); } 
        else { header.classList.remove('scrolled'); }
    });

    const menuToggle = document.getElementById('menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    if(menuToggle && mobileNav) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('is-active');
            mobileNav.classList.toggle('is-open');
            document.body.classList.toggle('no-scroll');
        });
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('is-active');
                mobileNav.classList.remove('is-open');
                document.body.classList.remove('no-scroll');
            });
        });
    }

    // 搜索功能需要立即响应，所以不延迟
    const searchBox = document.getElementById('search-box');
    const searchResultsContainer = document.getElementById('search-results');
    let activeIndex = -1;
    function highlightText(text, query) { if (!query) return text; const regex = new RegExp(`(${query})`, 'gi'); return text.replace(regex, '<span class="highlight">$1</span>'); }
    function displayResults(query) {
        const lowerCaseQuery = query.toLowerCase();
        const results = sitePages.filter(page => page.id !== 'placeholder1' && (page.title.toLowerCase().includes(lowerCaseQuery) || page.author.toLowerCase().includes(lowerCaseQuery) || page.keywords.toLowerCase().includes(lowerCaseQuery)));
        searchResultsContainer.style.display = results.length > 0 ? 'block' : 'none';
        if (results.length > 0) { searchResultsContainer.innerHTML = results.map(page => `<a href="${page.url}" class="result-item"><div class="title">${highlightText(page.title, query)}</div><div class="author">${highlightText(page.author, query)}</div></a>`).join(''); }
        activeIndex = -1;
    }
    function updateActiveItem() { const items = searchResultsContainer.querySelectorAll('.result-item'); items.forEach((item, index) => { item.classList.toggle('active', index === activeIndex); }); }
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    function handleSearch() {
        const query = searchBox.value.trim();
        if (query) {
            displayResults(query);
        } else {
            searchResultsContainer.style.display = 'none';
        }
    }

    searchBox.addEventListener('input', debounce(handleSearch, 300));
    
    searchBox.addEventListener('keydown', (e) => {
        const items = searchResultsContainer.querySelectorAll('.result-item'); if (!items.length) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); activeIndex = (activeIndex + 1) % items.length; updateActiveItem(); } 
        else if (e.key === 'ArrowUp') { e.preventDefault(); activeIndex = (activeIndex - 1 + items.length) % items.length; updateActiveItem(); } 
        else if (e.key === 'Enter') { e.preventDefault(); if (activeIndex > -1) { items[activeIndex].click(); } }
    });
    searchBox.addEventListener('blur', () => { setTimeout(() => { searchResultsContainer.style.display = 'none'; }, 150); });
    searchBox.addEventListener('focus', () => { if(searchBox.value.trim()){ displayResults(searchBox.value.trim()); } });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { searchResultsContainer.style.display = 'none'; searchBox.blur(); } });
}); 