/**
 * Authentication Module
 * Handles user login, JWT token management, and session handling
 */

// Configuration
const API_DOMAIN = 'learn.reboot01.com';
const AUTH_ENDPOINT = `https://${API_DOMAIN}/api/auth/signin`;

// Check if already logged in
if (localStorage.getItem('jwtToken')) {
    window.location.href = 'profile.html';
}

// DOM Elements
const loginForm = document.getElementById('loginForm');
const identifierInput = document.getElementById('identifier');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('errorMessage');
const loginBtn = document.getElementById('loginBtn');
const btnText = loginBtn.querySelector('.btn-text');
const btnLoader = loginBtn.querySelector('.btn-loader');

/**
 * Encode credentials to Base64 for Basic authentication
 * @param {string} identifier - Username or email
 * @param {string} password - User password
 * @returns {string} Base64 encoded credentials
 */
function encodeCredentials(identifier, password) {
    const credentials = `${identifier}:${password}`;
    return btoa(credentials);
}

/**
 * Show error message to user
 * @param {string} message - Error message to display
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

/**
 * Hide error message
 */
function hideError() {
    errorMessage.style.display = 'none';
}

/**
 * Set loading state on login button
 * @param {boolean} loading - Whether to show loading state
 */
function setLoading(loading) {
    if (loading) {
        loginBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'block';
    } else {
        loginBtn.disabled = false;
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
    }
}

/**
 * Validate input fields
 * @param {string} identifier - Username or email
 * @param {string} password - Password
 * @returns {boolean} Whether inputs are valid
 */
function validateInputs(identifier, password) {
    if (!identifier || !password) {
        showError('Please enter both username/email and password');
        return false;
    }
    
    if (identifier.length < 3) {
        showError('Username/email must be at least 3 characters');
        return false;
    }
    
    if (password.length < 3) {
        showError('Password must be at least 3 characters');
        return false;
    }
    
    return true;
}

/**
 * Decode JWT token to extract payload
 * @param {string} token - JWT token
 * @returns {object|null} Decoded token payload or null if invalid
 */
function decodeJWT(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }
        
        const payload = parts[1];
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decoded);
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
}

/**
 * Handle login form submission
 * @param {Event} event - Form submit event
 */
async function handleLogin(event) {
    event.preventDefault();
    hideError();
    
    const identifier = identifierInput.value.trim();
    const password = passwordInput.value;
    
    // Validate inputs
    if (!validateInputs(identifier, password)) {
        return;
    }
    
    setLoading(true);
    
    try {
        const encodedCredentials = encodeCredentials(identifier, password);
        
        const response = await fetch(AUTH_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${encodedCredentials}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const jwtToken = await response.text();
            
            // Validate JWT token
            const decoded = decodeJWT(jwtToken);
            if (!decoded) {
                throw new Error('Invalid token received from server');
            }
            
            // Store JWT token
            localStorage.setItem('jwtToken', jwtToken);
            
            // Store user info from JWT
            if (decoded.sub) {
                localStorage.setItem('userId', decoded.sub);
            }
            
            // Redirect to profile page
            window.location.href = 'profile.html';
        } else {
            // Handle different error status codes
            let errorMsg = 'Login failed. Please check your credentials.';
            
            if (response.status === 401) {
                errorMsg = 'Invalid username/email or password';
            } else if (response.status === 403) {
                errorMsg = 'Access forbidden. Please contact support.';
            } else if (response.status === 500) {
                errorMsg = 'Server error. Please try again later.';
            } else if (response.status >= 400 && response.status < 500) {
                errorMsg = 'Invalid credentials. Please try again.';
            }
            
            showError(errorMsg);
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Network error. Please check your connection and try again.');
    } finally {
        setLoading(false);
    }
}

/**
 * Logout function - clears JWT and redirects to login
 */
function logout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userId');
    window.location.href = 'index.html';
}

// Attach event listener to form
loginForm.addEventListener('submit', handleLogin);

// Export logout function for use in other modules
window.logout = logout;
