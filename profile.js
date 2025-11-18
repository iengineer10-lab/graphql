/**
 * Profile Page Module
 * Handles profile page initialization, data loading, and display
 */

// Check authentication on page load
const token = localStorage.getItem('jwtToken');
if (!token) {
    window.location.href = 'index.html';
}

// DOM Elements
const loadingOverlay = document.getElementById('loadingOverlay');
const errorContainer = document.getElementById('errorContainer');
const errorText = document.getElementById('errorText');
const profileContent = document.getElementById('profileContent');
const logoutBtn = document.getElementById('logoutBtn');

// User info elements
const userIdElement = document.getElementById('userId');
const userLoginElement = document.getElementById('userLogin');
const userEmailElement = document.getElementById('userEmail');

// Stats elements
const totalXPElement = document.getElementById('totalXP');
const auditRatioElement = document.getElementById('auditRatio');
const successRateElement = document.getElementById('successRate');
const projectCountElement = document.getElementById('projectCount');

/**
 * Show loading state
 */
function showLoading() {
    loadingOverlay.style.display = 'flex';
    errorContainer.style.display = 'none';
    profileContent.style.display = 'none';
}

/**
 * Show error state
 * @param {string} message - Error message to display
 */
function showError(message) {
    loadingOverlay.style.display = 'none';
    errorContainer.style.display = 'flex';
    profileContent.style.display = 'none';
    errorText.textContent = message;
}

/**
 * Show profile content
 */
function showContent() {
    loadingOverlay.style.display = 'none';
    errorContainer.style.display = 'none';
    profileContent.style.display = 'block';
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return Math.round(num).toLocaleString();
}

/**
 * Calculate total XP from transactions
 * @param {Array} transactions - XP transactions
 * @returns {number} Total XP
 */
function calculateTotalXP(transactions) {
    return transactions.reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate success rate from results
 * @param {Array} results - Project results
 * @returns {number} Success rate percentage
 */
function calculateSuccessRate(results) {
    if (!results || results.length === 0) return 0;
    
    let passCount = 0;
    let totalCount = 0;
    
    results.forEach(result => {
        if (result.grade !== null && result.grade !== undefined) {
            totalCount++;
            if (result.grade >= 1) {
                passCount++;
            }
        }
    });
    
    return totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 0;
}

/**
 * Count unique projects from transactions
 * @param {Array} transactions - XP transactions
 * @returns {number} Number of unique projects
 */
function countProjects(transactions) {
    const uniqueProjects = new Set();
    transactions.forEach(t => {
        if (t.object?.name) {
            uniqueProjects.add(t.object.name);
        }
    });
    return uniqueProjects.size;
}

/**
 * Display user information
 * @param {object} userInfo - User information object
 */
function displayUserInfo(userInfo) {
    if (!userInfo) return;
    
    userIdElement.textContent = userInfo.id || '-';
    userLoginElement.textContent = userInfo.login || '-';
    userEmailElement.textContent = userInfo.email || '-';
}

/**
 * Display statistics
 * @param {object} data - All profile data
 */
function displayStats(data) {
    // Total XP
    const totalXP = calculateTotalXP(data.xpTransactions);
    totalXPElement.textContent = formatNumber(totalXP);
    
    // Audit Ratio
    const auditRatio = data.auditData?.auditRatio || 0;
    auditRatioElement.textContent = auditRatio.toFixed(2);
    
    // Success Rate
    const successRate = calculateSuccessRate(data.results);
    successRateElement.textContent = `${successRate}%`;
    
    // Project Count
    const projectCount = countProjects(data.xpTransactions);
    projectCountElement.textContent = projectCount;
}

/**
 * Initialize graphs
 * @param {object} data - All profile data
 */
function initializeGraphs(data) {
    try {
        // XP Progress Over Time
        if (window.Graphs && window.Graphs.createXPProgressGraph) {
            window.Graphs.createXPProgressGraph('xpProgressGraph', data.xpTransactions);
        }
        
        // XP by Project
        if (window.Graphs && window.Graphs.createXPByProjectGraph) {
            window.Graphs.createXPByProjectGraph('xpByProjectGraph', data.xpTransactions);
        }
        
        // Audit Ratio
        if (window.Graphs && window.Graphs.createAuditRatioGraph) {
            window.Graphs.createAuditRatioGraph('auditRatioGraph', data.auditData);
        }
        
        // Pass/Fail Ratio
        if (window.Graphs && window.Graphs.createPassFailGraph) {
            window.Graphs.createPassFailGraph('passFailGraph', data.results);
        }
    } catch (error) {
        console.error('Error initializing graphs:', error);
    }
}

/**
 * Load and display profile data
 */
async function loadProfile() {
    showLoading();
    
    try {
        // Check if GraphQL module is loaded
        if (!window.GraphQL || !window.GraphQL.fetchAllProfileData) {
            throw new Error('GraphQL module not loaded');
        }
        
        // Fetch all profile data
        const data = await window.GraphQL.fetchAllProfileData();
        
        // Validate data
        if (!data) {
            throw new Error('No data received from server');
        }
        
        // Display user info
        displayUserInfo(data.userInfo);
        
        // Display statistics
        displayStats(data);
        
        // Show content
        showContent();
        
        // Initialize graphs (after content is visible for proper sizing)
        setTimeout(() => {
            initializeGraphs(data);
        }, 100);
        
    } catch (error) {
        console.error('Error loading profile:', error);
        
        let errorMessage = 'Failed to load profile data. ';
        
        if (error.message.includes('Authentication expired')) {
            errorMessage += 'Your session has expired. Please login again.';
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else if (error.message.includes('Network')) {
            errorMessage += 'Please check your internet connection.';
        } else {
            errorMessage += error.message || 'Please try again later.';
        }
        
        showError(errorMessage);
    }
}

/**
 * Handle logout
 */
function handleLogout() {
    if (window.logout) {
        window.logout();
    } else {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userId');
        window.location.href = 'index.html';
    }
}

// Event Listeners
logoutBtn.addEventListener('click', handleLogout);

// Handle window resize for responsive graphs
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Reload graphs on resize for better responsive behavior
        const data = window.currentProfileData;
        if (data) {
            initializeGraphs(data);
        }
    }, 250);
});

// Initialize profile on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
});

// Also load if DOMContentLoaded already fired
if (document.readyState === 'loading') {
    // Loading hasn't finished yet
    document.addEventListener('DOMContentLoaded', loadProfile);
} else {
    // `DOMContentLoaded` has already fired
    loadProfile();
}
