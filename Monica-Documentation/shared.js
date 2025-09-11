document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const mainContent = document.querySelector('.docs-main');
    
    // --- State ---
    let zoomLevel = 1;
    let textSizeAdjust = 0; // in rem

    // --- Sound Effect ---
    const audio = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU9vT19PAAAAAAACAgIAAASEgAABIYAICwgJAgALLgUIiAECCw8JEgABCIYACAwFCIsABQYHCQoBBAkJCAACCQkIAAMJCQgABQkJCQAHCQkIAAgJCQkACQkJCQAJCQkIAAYJCQkAAwkJCQADCQkJAAYJCQkABQkJCAADCQkJAAQJCQgABAkJCAAECAgIAAMICAgAAgYFAgACBQQEAAIEAwMAAgQDAwACBAMDAAIEAwIAAgQDAgACBAMCAAIEAwIAAgQDAgACBAMCAAIEAwIAAgQCAgADAgEBAAACAQECAAICAgACAgECAAICAgACAgICAAICAgACAgICAAICAgACAgICAAICAgACAgICAAICAgACAgICAAICAgACAgECAAICAQIAAQEBAgABAQIAAAEBAQAAAQEBAAABAQEAAAABAAAAAAEBAQAAAQEBAAABAQEAAAABAQEAAAABAQEAAAABAQAAAQAAAAEBAQAAAQEBAAABAQEAAAABAQAAAQAAAAEBAQAAAQEBAAABAQAAAQAAAAEBAQAAAQEBAAABAQEAAAABAQEAAAABAQAAAQAAAAEAAQAA");
    audio.preload = 'auto';
    const playSound = () => {
        try {
            audio.currentTime = 0;
            audio.play().catch(e => {}); // Fail silently if autoplay is blocked
        } catch (e) {}
    };

    // --- UI Controls ---
    const controls = {
        zoomIn: document.getElementById('zoom-in-btn'),
        zoomOut: document.getElementById('zoom-out-btn'),
        textInc: document.getElementById('text-inc-btn'),
        textDec: document.getElementById('text-dec-btn'),
        scrollTop: document.getElementById('scroll-top-btn'),
        scrollBottom: document.getElementById('scroll-bottom-btn'),
        navToggle: document.getElementById('nav-toggle-btn'),
    };

    const modalOverlay = document.getElementById('nav-modal-overlay');
    const navModal = document.getElementById('nav-modal');
    const modalCloseBtn = document.getElementById('nav-modal-close-btn');

    const updateStyles = () => {
        root.style.setProperty('--zoom-level', zoomLevel);
        root.style.setProperty('--text-size-adjust', `${textSizeAdjust}rem`);
    };

    // --- Event Listeners ---
    if (controls.zoomIn) controls.zoomIn.addEventListener('click', () => {
        zoomLevel = Math.min(1.5, zoomLevel + 0.1);
        updateStyles();
        playSound();
    });

    if (controls.zoomOut) controls.zoomOut.addEventListener('click', () => {
        zoomLevel = Math.max(0.7, zoomLevel - 0.1);
        updateStyles();
        playSound();
    });

    if (controls.textInc) controls.textInc.addEventListener('click', () => {
        textSizeAdjust = Math.min(0.5, textSizeAdjust + 0.1);
        updateStyles();
        playSound();
    });

    if (controls.textDec) controls.textDec.addEventListener('click', () => {
        textSizeAdjust = Math.max(-0.25, textSizeAdjust - 0.1);
        updateStyles();
        playSound();
    });

    if (controls.scrollTop) controls.scrollTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        playSound();
    });

    if (controls.scrollBottom) controls.scrollBottom.addEventListener('click', () => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        playSound();
    });

    const toggleNavModal = (forceClose = false) => {
        if (!modalOverlay || !navModal) return;
        
        const isOpen = modalOverlay.classList.contains('open');
        if (forceClose || isOpen) {
             modalOverlay.classList.remove('open');
             navModal.classList.remove('open');
        } else {
            modalOverlay.classList.add('open');
            navModal.classList.add('open');
            playSound();
        }
    };

    if (controls.navToggle) controls.navToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleNavModal();
    });
    
    if (modalOverlay) modalOverlay.addEventListener('click', () => toggleNavModal(true));
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => toggleNavModal(true));
    if (navModal) navModal.addEventListener('click', (e) => e.stopPropagation());
    
    // Add sound to all links and buttons
    document.querySelectorAll('a, button').forEach(el => {
        if (Object.values(controls).includes(el)) return; // Skip controls already handled
        el.addEventListener('click', playSound);
    });

    // Set active link in nav
    const navLinks = document.querySelectorAll('.nav-link');
    const setActiveLink = (link) => {
        if (!link) return;
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    };
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const activeLink = document.querySelector(`.nav-link[href$="${currentPath}"]`);
    setActiveLink(activeLink);
});