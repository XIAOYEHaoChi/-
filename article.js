document.addEventListener('DOMContentLoaded', () => {
    const body = document.getElementById('page-body');
    const themeToggle = document.getElementById('theme-toggle');
    const audioToggle = document.getElementById('play-audio');
    const audioElement = document.getElementById('recitation-audio');
    const largeFontToggle = document.getElementById('large-font-toggle');
    const hamburger = document.getElementById('hamburger-menu');
    const navCenter = document.querySelector('.nav-center');
    const navLinks = navCenter.querySelectorAll('a');
    const backToTopButton = document.getElementById('back-to-top');

    // --- 移动端导航脚本 ---
    const toggleNav = () => {
        const isActive = hamburger.classList.contains('active');
        if (isActive) {
            hamburger.classList.remove('active');
            navCenter.classList.add('closing');
            navCenter.addEventListener('animationend', () => navCenter.classList.remove('active', 'closing'), { once: true });
        } else {
            hamburger.classList.add('active');
            navCenter.classList.add('active');
        }
    };
    hamburger.addEventListener('click', toggleNav);
    navLinks.forEach(link => link.addEventListener('click', () => { if (hamburger.classList.contains('active')) toggleNav(); }));

    // --- 主题切换脚本 ---
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        const themeBtnText = themeToggle.querySelector('span');
        const sunIcon = document.getElementById('sun-icon');
        const moonIcon = document.getElementById('moon-icon');
        if (theme === 'dark') {
            if(themeBtnText) themeBtnText.textContent = '光明主题';
            sunIcon.style.display = 'inline-block';
            moonIcon.style.display = 'none';
        } else {
            if(themeBtnText) themeBtnText.textContent = '静夜主题';
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'inline-block';
        }
    }
    const currentTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(currentTheme);
    themeToggle.addEventListener('click', () => applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));

    // --- 音频播放脚本 ---
    if (audioToggle && audioElement) {
        audioToggle.addEventListener('click', () => {
            const audioBtnText = audioToggle.querySelector('span');
            const volumeIcon = document.getElementById('volume-icon');
            const pauseIcon = document.getElementById('pause-icon');
            if (audioElement.paused) {
                audioElement.play();
                if(audioBtnText) audioBtnText.textContent = '暂停朗诵';
                volumeIcon.style.display = 'none';
                pauseIcon.style.display = 'inline-block';
                audioToggle.classList.add('playing');
            } else {
                audioElement.pause();
                if(audioBtnText) audioBtnText.textContent = '聆听朗诵';
                volumeIcon.style.display = 'inline-block';
                pauseIcon.style.display = 'none';
                audioToggle.classList.remove('playing');
            }
        });
        audioElement.addEventListener('ended', () => {
            const audioBtnText = audioToggle.querySelector('span');
            if(audioBtnText) audioBtnText.textContent = '聆听朗诵';
            document.getElementById('volume-icon').style.display = 'inline-block';
            document.getElementById('pause-icon').style.display = 'none';
            audioToggle.classList.remove('playing');
        });
    }

    // --- 大字体模式脚本 ---
    if (largeFontToggle) {
        largeFontToggle.addEventListener('click', () => {
            body.classList.toggle('large-font-mode');
            const isLarge = body.classList.contains('large-font-mode');
            document.getElementById('zoom-in-icon').style.display = isLarge ? 'none' : 'inline-block';
            document.getElementById('zoom-out-icon').style.display = isLarge ? 'inline-block' : 'none';
        });
    }

    // --- [性能优化] 滚动动画脚本 ---
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const itemsToAnimate = entry.target.querySelectorAll('.animated-item');
                itemsToAnimate.forEach((item, index) => {
                    item.style.setProperty('--delay', `${index * 100}ms`);
                    item.classList.add('visible');
                });
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -80px 0px' });
    
    document.querySelectorAll('.article-title, .analysis-section, .translation-grid, .accordion').forEach(section => {
        observer.observe(section);
    });

    // --- 手风琴脚本 ---
    document.querySelectorAll('.accordion-item').forEach(item => {
        const header = item.querySelector('.accordion-header');
        const content = item.querySelector('.accordion-content');
        header.addEventListener('click', () => {
            const isActive = item.classList.toggle('active');
            content.style.maxHeight = isActive ? content.scrollHeight + "px" : null;
        });
    });

    // --- 返回顶部脚本 ---
    if (backToTopButton) {
        window.addEventListener('scroll', () => backToTopButton.classList.toggle('visible', window.scrollY > 300));
        backToTopButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // --- 页眉搜索功能脚本 ---
    const sitePages = [
        { id: 'chenqingbiao', title: '陈情表', author: '[晋] 李密', url: 'chenqingbiao.html', keywords: 'chenqingbiao 陈情表 李密 limi 晋 孝 奏表' },
        { id: 'xiangjixuanzhi', title: '项脊轩志', author: '[明] 归有光', url: 'xiangjixuanzhi.html', keywords: 'xiangjixuanzhi 项脊轩志 归有光 guiyouguang 明 散文 枇杷树' },
        { id: 'placeholder1', title: '待填之作', author: '[朝代] 作者', url: '#', keywords: '示例 placeholder' }
    ];
    const searchBox = document.getElementById('header-search-box');
    const searchResultsContainer = document.getElementById('header-search-results');
    let activeIndex = -1;

    function highlightText(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }
    function displayResults(query) {
        const lowerCaseQuery = query.toLowerCase();
        const results = sitePages.filter(page => page.id !== 'placeholder1' && (page.title.toLowerCase().includes(lowerCaseQuery) || page.author.toLowerCase().includes(lowerCaseQuery) || page.keywords.toLowerCase().includes(lowerCaseQuery)));
        if (searchResultsContainer) {
            searchResultsContainer.style.display = results.length > 0 ? 'block' : 'none';
            if (results.length > 0) {
                searchResultsContainer.innerHTML = results.map(page => `
                    <a href="${page.url}" class="result-item">
                        <div class="title">${highlightText(page.title, query)}</div>
                        <div class="author">${highlightText(page.author, query)}</div>
                    </a>
                `).join('');
            }
            activeIndex = -1;
        }
    }
    function updateActiveItem() {
        const items = searchResultsContainer.querySelectorAll('.result-item');
        items.forEach((item, index) => item.classList.toggle('active', index === activeIndex));
    }
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    function handleSearch() {
        if (searchBox) {
            const query = searchBox.value.trim();
            if (query) {
                displayResults(query);
            } else {
                if (searchResultsContainer) {
                    searchResultsContainer.style.display = 'none';
                }
            }
        }
    }
    if (searchBox) {
        searchBox.addEventListener('input', debounce(handleSearch, 300));
        
        searchBox.addEventListener('keydown', (e) => {
            const items = searchResultsContainer.querySelectorAll('.result-item');
            if (!items.length) return;
            if (e.key === 'ArrowDown') { e.preventDefault(); activeIndex = (activeIndex + 1) % items.length; updateActiveItem(); } 
            else if (e.key === 'ArrowUp') { e.preventDefault(); activeIndex = (activeIndex - 1 + items.length) % items.length; updateActiveItem(); } 
            else if (e.key === 'Enter') { e.preventDefault(); if (activeIndex > -1) items[activeIndex].click(); }
        });
        searchBox.addEventListener('blur', () => setTimeout(() => { if (searchResultsContainer) searchResultsContainer.style.display = 'none'; }, 150));
        searchBox.addEventListener('focus', () => { if(searchBox.value.trim()){ displayResults(searchBox.value.trim()); } });
    }
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (searchResultsContainer) searchResultsContainer.style.display = 'none'; if (searchBox) searchBox.blur(); } });
}); 