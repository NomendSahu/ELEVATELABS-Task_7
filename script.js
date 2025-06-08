
        let userData = [];
        let filteredData = [];
        let currentView = 'grid';
        let currentFilter = 'all';
        let fetchStartTime = 0;
        let retryCount = 0;
        let maxRetries = 3;

        // Initialize particles
        function createParticles() {
            const particlesContainer = document.querySelector('.particles');
            for (let i = 0; i < 50; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 6 + 's';
                particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
                particlesContainer.appendChild(particle);
            }
        }

        // Enhanced fetch with retry logic
        async function fetchUsers() {
            const loadingEl = document.getElementById('loadingContainer');
            const errorEl = document.getElementById('errorContainer');
            const usersContainer = document.getElementById('usersContainer');
            const statsContainer = document.getElementById('statsContainer');
            const fetchBtn = document.getElementById('fetchBtn');
            const reloadBtn = document.getElementById('reloadBtn');

            try {
                showLoading(true);
                hideError();
                fetchBtn.disabled = true;
                reloadBtn.disabled = true;
                fetchStartTime = Date.now();

                // Simulate network delay for better UX
                await new Promise(resolve => setTimeout(resolve, 500));

                const response = await fetch('https://jsonplaceholder.typicode.com/users', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    
                    signal: AbortSignal.timeout(10000) // 10 second timeout
                });
                console.log('API response data:', data);


                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                
                if (!Array.isArray(data) || data.length === 0) {
                    throw new Error('Invalid data format received');
                }

                userData = data.map(user => ({
                    ...user,
                    isOnline: Math.random() > 0.3, // Random online status
                    lastSeen: new Date(Date.now() - Math.random() * 86400000).toLocaleString(),
                    joinDate: new Date(Date.now() - Math.random() * 31536000000).toLocaleDateString()
                }));

                filteredData = [...userData];
                
                showLoading(false);
                displayUsers(filteredData);
                updateStats();
                updateLiveStats();
                showToast('✅ Users loaded successfully!', 'success');
                
                retryCount = 0;
                
            } catch (error) {
                showLoading(false);
                handleError(error);
                console.error('Fetch error:', error);
            } finally {
                fetchBtn.disabled = false;
                reloadBtn.disabled = false;
            }
        }

        // Enhanced error handling
        function handleError(error) {
            const errorContainer = document.getElementById('errorContainer');
            const errorTitle = document.getElementById('errorTitle');
            const errorMessage = document.getElementById('errorMessage');
            
            let title = 'Connection Error';
            let message = 'Unable to fetch user data. Please check your internet connection.';
            let icon = '🌐';

             if (error.name === 'TypeError') {
        // Usually indicates a network error or CORS issue
        title = 'Network Error';
        message = 'Failed to reach the server. Please check your network or try again later.';
        icon = '📡';
    } else if (error.name === 'AbortError') {
        // Triggered by AbortSignal.timeout
        title = 'Request Timeout';
        message = 'The request took too long and was aborted. Please try again.';
        icon = '⏱️';
    } else if (error.message.includes('Invalid data format')) {
        // Custom thrown error if data isn't in expected format
        title = 'Data Error';
        message = 'The server returned data in an unexpected format.';
        icon = '📄';
    } else if (retryCount < maxRetries) {
        // Retry logic with exponential backoff
        retryCount++;
        const retryDelay = 1000 * Math.pow(2, retryCount); // exponential backoff: 2s, 4s, 8s
        showToast(`Retrying... attempt ${retryCount} of ${maxRetries}`, 'warning');
        setTimeout(fetchUsers, retryDelay);
        return;
    } else {
        // Fallback for unhandled error types
        title = 'Unexpected Error';
        message = error.message || 'An unexpected error occurred.';
        icon = '❗';
    }

    errorTitle.textContent = `${icon} ${title}`;
    errorMessage.textContent = message;
    errorContainer.style.display = 'block';
}
function displayUsers(users) {
    const container = document.getElementById('usersContainer');
    container.innerHTML = ''; // Clear previous

    users.forEach(user => {
        const div = document.createElement('div');
        div.className = 'user-card';
        div.innerHTML = `
            <h3>${user.name}</h3>
            <p>📧 ${user.email}</p>
            <p>📱 ${user.phone}</p>
            <p>🟢 ${user.isOnline ? 'Online' : `Last seen: ${user.lastSeen}`}</p>
            <p>🗓️ Joined: ${user.joinDate}</p>
        `;
        container.appendChild(div);
    });
}
