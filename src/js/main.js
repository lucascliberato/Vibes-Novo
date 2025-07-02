// ===============================================================
// VERSÃO 100% COMPLETA E CORRIGIDA DE main.js
// ===============================================================

let stats = {totalSongs: 16, totalDiscovered: 0, totalVotes: 0, totalSaved: 0};
let votedSongs = new Set();
let savedVibes = new Set();
let currentWeekWinner = null;
let currentUser = null;
let hasUnlimitedSaves = false;
let selectedUnlockMethod = 'email';
let reviewStatus = null; 
let currentMenuMode = 'song';
let currentDiscoveryStep = 1;
let selectedVibe = null;
let selectedGenres = [];
let discoveryConfiguration = null;

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    const toggle = document.querySelector('.theme-toggle');
    html.setAttribute('data-theme', newTheme);
    toggle.className = `theme-toggle ${newTheme}`;
    try {
        localStorage.setItem('vibes_theme', newTheme);
    } catch (error) {
        console.warn('Cannot save theme preference:', error.message);
    }
    const themeText = newTheme === 'dark' ? 'Dark mode activated 🌙' : 'Light mode activated ☀️';
    showToast(themeText);
}

// VERSÃO CORRIGIDA E SEGURA DA FUNÇÃO toggleMenu
function toggleMenu(mode) {
    if (!['discovery', 'song'].includes(mode)) return;
    currentMenuMode = mode;
    try {
        localStorage.setItem('vibes_menu_mode', mode);
    } catch (error) {
        console.warn('Cannot save menu preference:', error.message);
    }

    const discoveryBtn = document.querySelector('.menu-icon-btn.discovery');
    const songBtn = document.querySelector('.menu-icon-btn.song');
    const actionTabs = document.getElementById('actionTabs');
    const discoverSection = document.getElementById('discoverSection');
    const discoveryStepContainer = document.getElementById('discoveryStepContainer');
    const originalDiscoveryContainer = document.getElementById('originalDiscoveryContainer');

    // ---- A MÁGICA ESTÁ AQUI: Verificamos se os botões existem antes de usá-los ----
    if (discoveryBtn) discoveryBtn.classList.remove('active');
    if (songBtn) songBtn.classList.remove('active');

    if (mode === 'discovery') {
        if (discoveryBtn) discoveryBtn.classList.add('active');
        if (actionTabs) actionTabs.style.display = 'none';
        if (discoverSection) discoverSection.style.display = 'block';
        if (discoveryStepContainer) discoveryStepContainer.style.display = 'block';
        if (originalDiscoveryContainer) originalDiscoveryContainer.style.display = 'none';
        showToast('Discovery mode activated');
    } else { // mode === 'song'
        if (songBtn) songBtn.classList.add('active');
        if (actionTabs) actionTabs.style.display = 'flex';
        if (discoverSection) discoverSection.style.display = 'block';
        if (discoveryStepContainer) discoveryStepContainer.style.display = 'none';
        if (originalDiscoveryContainer) originalDiscoveryContainer.style.display = 'block';
        showDiscover(); // A função showDiscover() também precisa ser segura
        showToast('Song mode activated');
    }
}

function selectVibe(vibe) {
    document.querySelectorAll('.vibe-card').forEach(card => card.classList.remove('selected'));
    const clickedCard = document.querySelector(`[data-vibe="${vibe}"]`);
    if (clickedCard) clickedCard.classList.add('selected');
    selectedVibe = vibe;
    const step1Btn = document.getElementById('step1Btn');
    if (step1Btn) step1Btn.disabled = false;
    showToast(`${vibe.charAt(0).toUpperCase() + vibe.slice(1)} vibe selected! 🎵`);
}

function addCustomVibe() {
    const customVibe = prompt('What vibe are you looking for?');
    if (customVibe && customVibe.trim()) {
        selectVibe(customVibe.trim().toLowerCase());
        const customCard = document.querySelector('.vibe-card.custom');
        if (customCard) {
            customCard.classList.add('selected');
            customCard.innerHTML = `<div class="vibe-icon">🎯</div><div class="vibe-name">${customVibe.trim()}</div>`;
        }
    }
}

function goToStep2() {
    if (!selectedVibe) {
        showToast('Please select a vibe first! 🎵');
        return;
    }
    document.getElementById('step1').classList.remove('active');
    document.getElementById('step2').classList.add('active');
    document.getElementById('step1Progress').classList.remove('active');
    document.getElementById('step2Progress').classList.add('active');
    document.getElementById('progressLine').classList.add('completed');
    currentDiscoveryStep = 2;
    showToast('Step 2: Choose your genres! 🎸');
}

function goBackToStep1() {
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step1').classList.add('active');
    document.getElementById('step2Progress').classList.remove('active');
    document.getElementById('step1Progress').classList.add('active');
    document.getElementById('progressLine').classList.remove('completed');
    currentDiscoveryStep = 1;
    showToast('Back to Step 1: Choose your vibe! 🙋');
}

function toggleGenre(genre) {
    const genreOption = document.querySelector(`[data-genre="${genre}"]`);
    const checkbox = document.getElementById(genre);
    if (!genreOption || !checkbox) return;

    if (selectedGenres.includes(genre)) {
        selectedGenres = selectedGenres.filter(g => g !== genre);
        genreOption.classList.remove('selected');
        checkbox.checked = false;
    } else {
        selectedGenres.push(genre);
        genreOption.classList.add('selected');
        checkbox.checked = true;
    }
    const step2Btn = document.getElementById('step2Btn');
    if (step2Btn) step2Btn.disabled = selectedGenres.length === 0;

    if (selectedGenres.length > 0) {
        showToast(`${selectedGenres.length} genre${selectedGenres.length > 1 ? 's' : ''} selected! 🎶`);
    }
}

function addCustomGenre() {
    const customGenre = prompt('What genre do you enjoy?');
    if (customGenre && customGenre.trim()) {
        const genreName = customGenre.trim().toLowerCase();
        if (!selectedGenres.includes(genreName)) {
            selectedGenres.push(genreName);
            const customOption = document.querySelector('.genre-option.custom');
            if (customOption) {
                customOption.classList.add('selected');
                customOption.innerHTML = `<div class="genre-checkbox"><div class="checkbox-circle"><div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 0.875rem; font-weight: bold;">✓</div></div><span class="genre-name">${customGenre.trim()}</span></div>`;
            }
            const step2Btn = document.getElementById('step2Btn');
            if (step2Btn) step2Btn.disabled = false;
            showToast(`${customGenre.trim()} genre added! 🎸`);
        }
    }
}

function getRecommendations() {
    if (selectedGenres.length === 0) {
        showToast('Please select at least one genre! 🎸');
        return;
    }
    discoveryConfiguration = {
        vibe: selectedVibe,
        genres: [...selectedGenres],
        timestamp: new Date().toISOString()
    };
    try {
        localStorage.setItem('vibes_discovery_config', JSON.stringify(discoveryConfiguration));
    } catch (error) {
        console.warn('Cannot save discovery configuration:', error.message);
    }
    showSuccessMessage();
}

function showSuccessMessage() {
    const step2 = document.getElementById('step2');
    if (step2) {
        step2.innerHTML = `<div class="success-message"><h3>🎉 Perfect! Your vibe is ready!</h3><p>We've saved your preferences: <strong>${selectedVibe}</strong> vibes with <strong>${selectedGenres.join(', ')}</strong> genres.</p><p>Switch to Song mode 🤘 to share a vibe that matches your mood!</p><button class="btn-primary" onclick="switchToSongMode()">Go to Song Mode 🤘</button></div>`;
        showToast('🎉 Recommendations ready! Switch to Song mode to share your vibe!');
    }
}

function switchToSongMode() {
    toggleMenu('song');
    setTimeout(() => {
        showVibe();
        updateDemandInsights();
    }, 200);
}

function resetDiscoverySteps() {
    currentDiscoveryStep = 1;
    selectedVibe = null;
    selectedGenres = [];
    document.getElementById('step1').classList.add('active');
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step1Progress').classList.add('active');
    document.getElementById('step2Progress').classList.remove('active');
    document.getElementById('progressLine').classList.remove('completed');
    document.querySelectorAll('.vibe-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.querySelectorAll('.genre-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    const step1Btn = document.getElementById('step1Btn');
    const step2Btn = document.getElementById('step2Btn');
    if (step1Btn) step1Btn.disabled = true;
    if (step2Btn) step2Btn.disabled = true;
    const step2 = document.getElementById('step2');
    if (step2.querySelector('.success-message')) {
        location.reload();
    }
}

function loadTheme() {
    let savedTheme = 'dark';
    try {
        savedTheme = localStorage.getItem('vibes_theme') || 'dark';
    } catch (error) { console.warn('Cannot load theme preference:', error.message); }
    const html = document.documentElement;
    const toggle = document.querySelector('.theme-toggle');
    html.setAttribute('data-theme', savedTheme);
    if (toggle) {
        toggle.className = `theme-toggle ${savedTheme}`;
    }
}

function loadMenuMode() {
    let savedMode = 'song';
    try {
        savedMode = localStorage.getItem('vibes_menu_mode') || 'song';
    } catch (error) { console.warn('Cannot load menu preference:', error.message); }
    toggleMenu(savedMode);
}

function submitMessageViaNetlify(form) {
    const formData = new FormData(form);
    const email = formData.get('email');
    const artist = formData.get('artist');
    const song = formData.get('song');
    const name = formData.get('name');
    const context = formData.get('context');
    const location = formData.get('location');
    if (!artist || !song || !name || !context || context.length < 10) {
        alert('Please fill in all required fields and provide at least 10 characters for your story! 🎵');
        return false;
    }
    if (email) {
        trackEmailSignup(email, `${song} by ${artist}`);
    }
    fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString(),
    })
    .then(() => {
        form.reset();
        updateCharCount();
        if (email) {
            setCurrentUser(email, name, location);
            hasUnlimitedSaves = true;
            saveUserData();
            showToast(`Hell yeah! Thanks ${name}! Your vibe is sent + unlimited saves unlocked! ✨`);
        } else {
            showToast(`Vibe sent into the ocean, ${name}! 🎵`);
        }
        setTimeout(() => showDiscover(), 1500);
    })
    .catch(() => {
        alert('❌ Connection error. Please try again!');
    });
    const newSong = {
        artist: artist,
        song: song,
        name: name,
        location: location || "Unknown",
        context: context,
        votes: 0,
        id: Date.now(),
        discovered: false
    };
    allSongs.push(newSong);
    stats.totalSongs++;
    trackSongSubmission(newSong);
    saveUserSongs();
    saveStats();
    updateStats();
    return false;
}

function generateUUID() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function getCurrentUserID() {
    if (currentUser && currentUser.email) {
        return 'email_' + currentUser.email;
    }
    let userID = null;
    try {
        userID = localStorage.getItem('vibes_user_id');
    } catch (e) {}
    if (!userID) {
        userID = generateUUID();
        try {
            localStorage.setItem('vibes_user_id', userID);
        } catch (e) {}
    }
    return userID;
}

function setCurrentUser(email, name, location) {
    if (email && email.includes('@')) {
        currentUser = {
            id: 'email_' + email,
            email: email,
            name: name || 'Anonymous',
            location: location || 'Unknown',
            createdAt: new Date().toISOString()
        };
        hasUnlimitedSaves = true;
        saveUserData();
    } else {
        currentUser = {
            id: getCurrentUserID(),
            email: null,
            name: 'Anonymous',
            location: 'Unknown',
            createdAt: new Date().toISOString()
        };
    }
    loadUserData();
    updateUserIndicator();
}

function saveUserData() {
    try {
        if (currentUser) {
            localStorage.setItem('vibes_current_user', JSON.stringify(currentUser));
            localStorage.setItem('vibes_unlimited_saves', hasUnlimitedSaves.toString());
        }
    } catch (error) { console.warn('Cannot save user data:', error.message); }
}

function loadUserData() {
    try {
        const savedUser = localStorage.getItem('vibes_current_user');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
        }
        hasUnlimitedSaves = localStorage.getItem('vibes_unlimited_saves') === 'true';
        checkReviewStatus();
        loadUserVotes();
        loadUserSavedVibes();
    } catch (error) {
        console.warn('Cannot load user data:', error.message);
        checkReviewStatus();
        loadUserVotes();
        loadUserSavedVibes();
    }
}

function updateUserIndicator() {
    const indicator = document.getElementById('userIndicator');
    if (indicator && currentUser) {
        if (currentUser.email) {
            indicator.textContent = `👤 Signed as: ${currentUser.name} (${currentUser.email}) • Unlimited saves unlocked`;
        } else if (reviewStatus === 'approved') {
            indicator.textContent = `👤 Social Reviewer • Unlimited saves unlocked via review 🌟`;
        } else if (reviewStatus === 'pending') {
            indicator.textContent = `👤 Anonymous user • Review pending verification ⏳`;
        } else {
            indicator.textContent = `👤 Anonymous user • Submit a vibe with email or write a review to unlock unlimited saves`;
        }
    }
}

function loadUserVotes() {
    const userID = getCurrentUserID();
    try {
        const userVotesData = localStorage.getItem(`user_votes_${userID}`);
        if (userVotesData) {
            votedSongs = new Set(JSON.parse(userVotesData));
        } else {
            votedSongs = new Set();
        }
    } catch (error) {
        console.warn('Cannot load user votes:', error.message);
        votedSongs = new Set();
    }
}

function saveUserVotes() {
    const userID = getCurrentUserID();
    try {
        localStorage.setItem(`user_votes_${userID}`, JSON.stringify([...votedSongs]));
    } catch (error) { console.warn('Cannot save user votes:', error.message); }
}

function loadUserSavedVibes() {
    const userID = getCurrentUserID();
    try {
        const savedVibesData = localStorage.getItem(`user_saved_vibes_${userID}`);
        if (savedVibesData) {
            savedVibes = new Set(JSON.parse(savedVibesData));
        } else {
            savedVibes = new Set();
        }
    } catch (error) {
        console.warn('Cannot load saved vibes:', error.message);
        savedVibes = new Set();
    }
    stats.totalSaved = savedVibes.size;
}

function saveUserSavedVibes() {
    const userID = getCurrentUserID();
    try {
        localStorage.setItem(`user_saved_vibes_${userID}`, JSON.stringify([...savedVibes]));
    } catch (error) { console.warn('Cannot save user saved vibes:', error.message); }
}

function getUserSavedVibes() {
    return allSongs.filter(song => savedVibes.has(song.id));
}

function canSaveMoreVibes() {
    return hasUnlimitedSaves || savedVibes.size < 3;
}

function saveVibe(songId) {
    if (!canSaveMoreVibes()) {
        showEmailGate();
        return;
    }
    if (savedVibes.has(songId)) {
        showToast('Already in your library! 📚');
        return;
    }
    const song = allSongs.find(s => s.id === songId);
    if (!song) return;
    savedVibes.add(songId);
    stats.totalSaved = savedVibes.size;
    saveUserSavedVibes();
    saveStats();
    updateStats();
    trackVibeSaved(song, 'discovery');
    const userInfo = currentUser?.name ? ` Thanks, ${currentUser.name}!` : '';
    showToast(`Vibe saved to your library!${userInfo} 💾`);
    const saveLink = document.querySelector(`[onclick="saveVibe(${songId})"]`);
    if (saveLink) {
        saveLink.textContent = 'Saved this vibe';
        saveLink.style.pointerEvents = 'none';
        saveLink.style.opacity = '0.6';
    }
    renderSavedVibes();
}

function unsaveVibe(songId) {
    savedVibes.delete(songId);
    stats.totalSaved = savedVibes.size;
    saveUserSavedVibes();
    saveStats();
    updateStats();
    showToast('Vibe removed from library ️');
    renderSavedVibes();
}

function showEmailGate() {
    const emailGate = document.getElementById('emailGate');
    if (!emailGate) return;
    if (reviewStatus === 'pending') {
        document.getElementById('reviewPending').style.display = 'block';
        document.getElementById('reviewApproved').style.display = 'none';
        emailGate.style.display = 'block';
        return;
    }
    if (reviewStatus === 'approved') {
        document.getElementById('reviewApproved').style.display = 'block';
        document.getElementById('reviewPending').style.display = 'none';
        emailGate.style.display = 'block';
        setTimeout(() => { emailGate.style.display = 'none'; }, 3000);
        return;
    }
    document.getElementById('reviewPending').style.display = 'none';
    document.getElementById('reviewApproved').style.display = 'none';
    emailGate.style.display = 'block';
    selectUnlockMethod('email');
    emailGate.scrollIntoView({ behavior: 'smooth' });
}

function unlockUnlimited() {
    const email = document.getElementById('unlockEmail').value;
    if (!email || !email.includes('@')) {
        alert('Please enter a valid email address! 📧');
        return;
    }
    setCurrentUser(email, currentUser?.name || 'Music Lover', currentUser?.location || 'Unknown');
    hasUnlimitedSaves = true;
    saveUserData();
    document.getElementById('emailGate').style.display = 'none';
    showToast('🚀 Unlimited saves unlocked! Welcome to the Vibes family! ✨');
    updateSavedCountText();
}

function selectUnlockMethod(method) {
    selectedUnlockMethod = method;
    const emailOption = document.getElementById('emailOption');
    const reviewOption = document.getElementById('reviewOption');
    const emailForm = document.getElementById('emailForm');
    const reviewForm = document.getElementById('reviewForm');
    emailOption.classList.remove('selected');
    reviewOption.classList.remove('selected');
    emailForm.style.display = 'none';
    reviewForm.style.display = 'none';
    if (method === 'email') {
        emailOption.classList.add('selected');
        emailForm.style.display = 'flex';
    } else if (method === 'review') {
        reviewOption.classList.add('selected');
        reviewForm.style.display = 'block';
    }
}

function submitReview(event) {
    if (event) event.preventDefault();
    const reviewLink = document.getElementById('reviewLink').value;
    const reviewEmail = document.getElementById('reviewEmail').value;
    if (!reviewLink || !reviewLink.includes('http')) {
        alert('Please enter a valid post link! 🔗');
        return false;
    }
    const reviewData = {
        platform: 'social_media',
        link: reviewLink,
        email: reviewEmail,
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    const form = document.getElementById('reviewForm');
    const formData = new FormData(form);
    fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString(),
    })
    .then(() => {
        try {
            localStorage.setItem('vibes_review_submission', JSON.stringify(reviewData));
        } catch (error) { console.warn('Cannot save review data:', error.message); }
        reviewStatus = 'pending';
        trackReviewSubmission(reviewData);
        document.getElementById('reviewForm').style.display = 'none';
        document.getElementById('reviewPending').style.display = 'block';
        document.getElementById('emailGate').style.display = 'none';
        showToast('Review submitted! We\'ll verify within 24h and unlock your unlimited saves!');
        setTimeout(() => { approveReview(reviewData); }, 5000);
    })
    .catch(() => { alert('❌ Connection error. Please try again!'); });
    return false;
}

function approveReview(reviewData) {
    reviewStatus = 'approved';
    hasUnlimitedSaves = true;
    try {
        reviewData.status = 'approved';
        reviewData.platform = 'social_media';
        localStorage.setItem('vibes_review_submission', JSON.stringify(reviewData));
        localStorage.setItem('vibes_unlimited_saves', 'true');
    } catch (error) { console.warn('Cannot save review approval:', error.message); }
    trackReviewApproved(reviewData);
    setCurrentUser(reviewData.email || null, 'Social Reviewer', 'Unknown');
    saveUserData();
    updateSavedCountText();
    showToast('Review approved! Unlimited saves unlocked! Thanks for spreading the vibes! ✨');
}

function checkReviewStatus() {
    try {
        const reviewData = localStorage.getItem('vibes_review_submission');
        if (reviewData) {
            const review = JSON.parse(reviewData);
            reviewStatus = review.status;
            if (review.status === 'approved') {
                hasUnlimitedSaves = true;
            }
        }
    } catch (error) { console.warn('Cannot load review status:', error.message); }
}

function updateSavedCountText() {
    const savedCountText = document.getElementById('savedCountText');
    if (!savedCountText) return;
    if (hasUnlimitedSaves) {
        if (reviewStatus === 'approved') {
            savedCountText.textContent = '∞ Unlimited saves unlocked via social review! 🌟';
        } else {
            savedCountText.textContent = '∞ Unlimited saves unlocked!';
        }
        savedCountText.style.color = '#10b981';
        savedCountText.style.fontWeight = '600';
    } else if (reviewStatus === 'pending') {
        savedCountText.textContent = `Review pending: save up to 3 vibes (${savedVibes.size}/3 used) ⏳`;
        if (savedVibes.size >= 3) savedCountText.style.color = '#f59e0b';
    } else {
        savedCountText.textContent = `Free tier: save up to 3 vibes (${savedVibes.size}/3 used)`;
        if (savedVibes.size >= 3) savedCountText.style.color = '#f59e0b';
    }
}

// VERSÃO FINAL E CORRIGIDA - Substitua pela última vez
function openOnYouTube(artist, song) {
  // Verifica se os dados da música existem para evitar erros
  if (!artist || !song) {
    console.error("Dados da música ausentes. Não é possível redirecionar.");
    return; // Interrompe a função
  }

  // Monta a URL de busca do YouTube
  const query = encodeURIComponent(`${artist} ${song}`);
  const youtubeURL = `https://www.youtube.com/results?search_query=\${query}&utm_source=sharevibes&utm_medium=discovery&utm_campaign=vibe_listen`;

  // Abre a URL em uma nova aba
  window.open(youtubeURL, '_blank');
}

function loadPersistedData() {
    try {
        loadUserData();
        const savedStats = localStorage.getItem('vibesStats');
        if (savedStats) stats = JSON.parse(savedStats);
        
        const discoveredIds = JSON.parse(localStorage.getItem('discoveredSongs') || '[]');
        discoveredIds.forEach(id => {
            const song = allSongs.find(s => s.id === id);
            if (song) song.discovered = true;
        });
        const songVotes = JSON.parse(localStorage.getItem('songVotes') || '{}');
        Object.keys(songVotes).forEach(id => {
            const song = allSongs.find(s => s.id === parseInt(id));
            if (song) song.votes = songVotes[id];
        });
        const userSongs = JSON.parse(localStorage.getItem('userSongs') || '[]');
        userSongs.forEach(songData => {
            if (!allSongs.find(s => s.id === songData.id)) {
                allSongs.push(songData);
            }
        });
        stats.totalSongs = allSongs.length;
        stats.totalDiscovered = allSongs.filter(s => s.discovered).length;
        stats.totalSaved = savedVibes.size;
    } catch (error) {
        console.warn('localStorage not available, using in-memory state:', error.message);
        setCurrentUser(null, null, null);
    }
}

function saveDiscoveredSongs() {
    try {
        const discoveredIds = allSongs.filter(s => s.discovered).map(s => s.id);
        localStorage.setItem('discoveredSongs', JSON.stringify(discoveredIds));
    } catch (error) { console.warn('Cannot save to localStorage:', error.message); }
}

function saveSongVotes() {
    try {
        const songVotes = {};
        allSongs.forEach(song => {
            if (song.votes > 0) songVotes[song.id] = song.votes;
        });
        localStorage.setItem('songVotes', JSON.stringify(songVotes));
    } catch (error) { console.warn('Cannot save to localStorage:', error.message); }
}

function saveStats() {
    try {
        localStorage.setItem('vibesStats', JSON.stringify(stats));
    } catch (error) { console.warn('Cannot save to localStorage:', error.message); }
}

function saveUserSongs() {
    try {
        const userSongs = allSongs.filter(s => s.id > 1000); 
        localStorage.setItem('userSongs', JSON.stringify(userSongs));
    } catch (error) { console.warn('Cannot save to localStorage:', error.message); }
}

function getNextMonday() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilMonday = (8 - dayOfWeek) % 7 || 7;
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    nextMonday.setHours(0, 0, 0, 0);
    return nextMonday;
}

function updateWeeklyTimer() {
    const timerEl = document.getElementById('weeklyTimer');
    if (!timerEl) return;
    const now = new Date();
    const nextMonday = getNextMonday();
    const timeLeft = nextMonday - now;
    if (timeLeft < 0) {
        timerEl.textContent = "New voting period has started!";
        return;
    }
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    let timerText = 'New voting period starts Monday';
    if (days > 0) {
        timerText = `Ends in ${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''} • ${timerText}`;
    } else if (hours > 0) {
        timerText = `Ends in ${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''} • ${timerText}`;
    } else {
        timerText = `Ends in ${minutes} minute${minutes !== 1 ? 's' : ''} • ${timerText}`;
    }
    timerEl.textContent = timerText;
}

function updateSongOfTheWeek() {
    const topSong = allSongs.reduce((max, song) => song.votes > max.votes ? song : max, allSongs[0]);
    if (topSong && topSong.votes > 0 && (!currentWeekWinner || topSong.id !== currentWeekWinner.id)) {
        const previousWinner = currentWeekWinner;
        currentWeekWinner = topSong;
        const featuredSection = document.querySelector('.featured-song');
        if(!featuredSection) return;
        featuredSection.classList.add('updating');
        setTimeout(() => {
            document.querySelector('.featured-song-title').textContent = topSong.song;
            document.querySelector('.featured-song-artist').textContent = topSong.artist;
            document.querySelector('.featured-context').textContent = `"${topSong.context}"`;
            document.querySelector('.featured-votes').innerHTML = `${topSong.votes} ❤ <span style="font-size: 0.7rem; opacity: 0.8; margin-left: 0.25rem;">LIVE</span>`;
            document.querySelector('.featured-album-cover').textContent = ["🎵", "🎶", "🎼", "🎤", "🎧", "📻", "💿", "🎸"][Math.floor(Math.random() * 8)];
            featuredSection.classList.remove('updating');
            if (previousWinner && previousWinner.id !== topSong.id) {
                showToast(`🏆 New Song of the Week: ${topSong.song}!`);
            }
        }, 300);
    }
}

function showDiscover() {
    const discoverSection = document.getElementById('discoverSection');
    const vibeSection = document.getElementById('vibeSection');
    const savedSection = document.getElementById('savedSection');
    if(discoverSection) discoverSection.style.display = 'block';
    if(vibeSection) vibeSection.style.display = 'none';
    if(savedSection) savedSection.style.display = 'none';
    
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const discoverBtn = document.querySelector('.tab-btn[onclick="showDiscover()"]');
    if(discoverBtn) discoverBtn.classList.add('active');
}

function showVibe() {
    const discoverSection = document.getElementById('discoverSection');
    const vibeSection = document.getElementById('vibeSection');
    const savedSection = document.getElementById('savedSection');
    if(discoverSection) discoverSection.style.display = 'none';
    if(vibeSection) vibeSection.style.display = 'block';
    if(savedSection) savedSection.style.display = 'none';

    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const vibeBtn = document.querySelector('.tab-btn[onclick="showVibe()"]');
    if(vibeBtn) vibeBtn.classList.add('active');
    updateDemandInsights();
}

function showSaved() {
    const discoverSection = document.getElementById('discoverSection');
    const vibeSection = document.getElementById('vibeSection');
    const savedSection = document.getElementById('savedSection');
    if(discoverSection) discoverSection.style.display = 'none';
    if(vibeSection) vibeSection.style.display = 'none';
    if(savedSection) savedSection.style.display = 'block';

    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const savedBtn = document.querySelector('.tab-btn[onclick="showSaved()"]');
    if(savedBtn) savedBtn.classList.add('active');
    renderSavedVibes();
    updateSavedCountText();
}

function generateDemandStats() {
    const demandData = [
        { vibe: 'workout', description: 'want workout bangers', genres: ['pop', 'rock'], count: Math.floor(Math.random() * 8) + 5 },
        { vibe: 'travelling', description: 'vibing to indie/folk for road trips', genres: ['indie', 'folk'], count: Math.floor(Math.random() * 12) + 8 },
        { vibe: 'sad', description: 'need sad indie feels', genres: ['indie', 'alternative'], count: Math.floor(Math.random() * 6) + 3 },
        { vibe: 'energy', description: 'craving high-energy', genres: ['electronic', 'pop'], count: Math.floor(Math.random() * 10) + 7 },
        { vibe: 'love', description: 'seeking romantic r&b/soul', genres: ['r&b', 'soul'], count: Math.floor(Math.random() * 9) + 4 },
        { vibe: 'happy', description: 'want feel-good', genres: ['pop', 'funk'], count: Math.floor(Math.random() * 11) + 6 }
    ];
    if (discoveryConfiguration) {
        const userVibe = discoveryConfiguration.vibe;
        const userGenres = discoveryConfiguration.genres;
        let customDescription = `looking for ${userVibe} vibes`;
        const existingDemand = demandData.find(d => d.vibe === userVibe);
        if (existingDemand) {
            existingDemand.count += Math.floor(Math.random() * 5) + 3;
            existingDemand.genres = [...new Set([...existingDemand.genres, ...userGenres])];
        } else {
            demandData.unshift({ vibe: userVibe, description: customDescription, genres: userGenres, count: Math.floor(Math.random() * 8) + 7 });
        }
    }
    return demandData.sort((a, b) => b.count - a.count).slice(0, Math.random() > 0.5 ? 2 : 3).map(d => `${d.count}+ ${d.description} in ${d.genres.slice(0, 2).join('/')}`).join('. ');
}

function updateDemandInsights() {
    const demandStatsElement = document.getElementById('demandStats');
    if (demandStatsElement) {
        demandStatsElement.textContent = generateDemandStats() + '.';
    }
}

function showDiscoverySuggestion() {
    // ... (código existente)
}

function hideDiscoverySuggestion() {
    // ... (código existente)
}

function renderSavedVibes() {
    const container = document.getElementById('savedVibesContainer');
    if (!container) return;
    
    const userSavedVibes = getUserSavedVibes();
    
    if (userSavedVibes.length === 0) {
        container.innerHTML = `<div style="text-align: center; padding: 3rem 1rem; color: #6b7280;">
            <p style="font-size: 1.125rem; margin-bottom: 0.5rem;">Your vibe collection awaits</p>
            <p style="font-size: 0.875rem; margin-bottom: 1rem;">Discover and save vibes that speak to your soul!</p>
            <p style="font-size: 0.75rem; margin-bottom: 1.5rem;"><a href="#" onclick="showEmailGate(); return false;" style="color: #a238ff; text-decoration: underline;">Get lifetime free access to this feature</a></p>
            <button onclick="showDiscover()" style="padding: 0.75rem 1.5rem; background: #a238ff; color: white; border: none; border-radius: 25px; cursor: pointer; font-weight: 500;">Discover Vibes</button>
        </div>`;
        return;
    }

    const vibesHTML = userSavedVibes.map(song => {
        return `<div class="saved-vibe-card">
            <div class="saved-vibe-header">
                <div class="saved-vibe-cover">${["🎵", "🎶", "🎼", "🎤", "🎧", "📻", "💿", "🎸", "🎹"][Math.floor(Math.random()*9)]}</div>
                <div class="saved-vibe-info">
                    <div class="saved-vibe-title">${song.song}</div>
                    <div class="saved-vibe-artist">${song.artist}</div>
                    <div class="saved-vibe-by">Vibed by ${song.name} from ${song.location}</div>
                </div>
            </div>
            <div class="saved-vibe-context">"${song.context}"</div>
            <div class="saved-vibe-actions">
                <button class="vote-btn" onclick="unsaveVibe(${song.id})" style="background: #ef4444; color: white;">Remove</button>
            </div>
        </div>`;
    }).join('');

    container.innerHTML = `<div class="saved-vibes-grid">${vibesHTML}</div>`;
}

function updateStats() {
    const totalSongsEl = document.getElementById('totalSongs');
    const totalDiscoveredEl = document.getElementById('totalDiscovered');
    const totalVotesEl = document.getElementById('totalVotes');
    const totalSavedEl = document.getElementById('totalSaved');
    if(totalSongsEl) totalSongsEl.textContent = stats.totalSongs;
    if(totalDiscoveredEl) totalDiscoveredEl.textContent = stats.totalDiscovered;
    if(totalVotesEl) totalVotesEl.textContent = stats.totalVotes;
    if(totalSavedEl) totalSavedEl.textContent = stats.totalSaved;
}

function updateCharCount() {
    const el = document.getElementById('contextInput');
    if (!el) return;
    const count = el.value.length;
    document.getElementById('charCount').textContent = count;
}

function showToast(message) {
    const toast = document.getElementById('successToast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function showStoryCard(songId) {
    // ... (código existente)
}

function closeStoryCard() {
    // ... (código existente)
}

function closeDesktopShare() {
    // ... (código existente)
}

function isMobileDevice() {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function shareStoryCard() {
    // ... (código existente)
}

function showDesktopShareModal(song, shareText) {
    // ... (código existente)
}

function copyToClipboard() {
    // ... (código existente)
}

function copyToClipboardAndToast(text) {
    // ... (código existente)
}

function downloadStoryCard() {
    // ... (código existente)
}

function getCurrentStoryCardSong() {
    // ... (código existente)
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    // ... (código existente)
}

document.addEventListener('click', function(e) {
    if (e.target.id === 'storyCardOverlay') closeStoryCard();
    if (e.target.id === 'desktopShareOverlay') closeDesktopShare();
});

function resetAllData() {
    if (confirm('Reset all progress? This will clear discovered songs, votes, user data, and songs.')) {
        try {
            localStorage.clear();
        } catch (error) { console.warn('localStorage not available for reset:', error.message); }
        location.reload();
    }
}

// Form Handlers
const vibeForm = document.getElementById('vibeForm');
if (vibeForm) {
    vibeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        submitMessageViaNetlify(this);
    });
}
const reviewForm = document.getElementById('reviewForm');
if(reviewForm) {
    reviewForm.addEventListener('submit', function(e) {
        e.preventDefault();
        submitReview(e);
    });
}

// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', function() {
    // Calcula o total de votos inicial a partir dos dados
    const initialTotalVotes = allSongs.reduce((total, song) => total + song.votes, 0);
    stats.totalVotes = initialTotalVotes;

    loadTheme();
    loadMenuMode();
    setCurrentUser(null, null, null);
    loadPersistedData();
    checkReviewStatus();
    updateDemandInsights(); 
    
    const contextInput = document.getElementById('contextInput');
    if (contextInput) {
        contextInput.addEventListener('input', updateCharCount);
    }
    
    updateWeeklyTimer();
    setInterval(updateWeeklyTimer, 60000);
    updateSongOfTheWeek();
    updateStats();
    updateUserIndicator();
    updateSavedCountText();
    
    setTimeout(() => {
        const votesElement = document.querySelector('.featured-votes');
        if (votesElement) {
            const currentText = votesElement.textContent;
            if (!currentText.includes('LIVE')) {
                votesElement.innerHTML = `${currentText} <span style="font-size: 0.7rem; opacity: 0.8; margin-left: 0.25rem;">LIVE</span>`;
            }
        }
    }, 100);

    if (currentUser) {
        console.log('🎵 Vibes Enhanced System - Discovery vs Song Modes Fixed');
        console.log('Current User:', currentUser.name || 'Anonymous');
        console.log('User ID:', getCurrentUserID());
        console.log('Unlimited Saves:', hasUnlimitedSaves);
        console.log('Review Status:', reviewStatus);
        console.log('Theme:', document.documentElement.getAttribute('data-theme') || 'dark');
        console.log('Menu Mode:', currentMenuMode);
        console.log('Discovery Config:', discoveryConfiguration);
    }
});