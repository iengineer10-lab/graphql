/**
 * GraphQL Query Module
 * Handles all GraphQL queries to the API
 */

// Configuration
const API_DOMAIN = 'learn.reboot01.com';
const GRAPHQL_ENDPOINT = `https://${API_DOMAIN}/api/graphql-engine/v1/graphql`;

/**
 * Get JWT token from localStorage
 * @returns {string|null} JWT token or null if not found
 */
function getToken() {
    return localStorage.getItem('jwtToken');
}

/**
 * Execute a GraphQL query
 * @param {string} query - GraphQL query string
 * @param {object} variables - Query variables (optional)
 * @returns {Promise<object>} Query result data
 */
async function executeGraphQLQuery(query, variables = {}) {
    const token = getToken();
    
    if (!token) {
        throw new Error('No authentication token found');
    }
    
    try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                query,
                variables
            })
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('jwtToken');
                window.location.href = 'index.html';
                throw new Error('Authentication expired. Please login again.');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.errors) {
            console.error('GraphQL errors:', result.errors);
            throw new Error(result.errors[0]?.message || 'GraphQL query failed');
        }
        
        return result.data;
    } catch (error) {
        console.error('GraphQL query error:', error);
        throw error;
    }
}

/**
 * Fetch basic user information
 * @returns {Promise<object>} User data
 */
async function fetchUserInfo() {
    const query = `
        query {
            user {
                id
                login
                email
            }
        }
    `;
    
    const data = await executeGraphQLQuery(query);
    return data.user && data.user.length > 0 ? data.user[0] : null;
}

/**
 * Fetch XP transactions
 * @returns {Promise<Array>} XP transactions
 */
async function fetchXPTransactions() {
    const query = `
        query {
            transaction(
                where: { type: { _eq: "xp" } }
                order_by: { createdAt: asc }
            ) {
                amount
                createdAt
                path
                object {
                    name
                }
            }
        }
    `;
    
    const data = await executeGraphQLQuery(query);
    return data.transaction || [];
}

/**
 * Fetch audit ratio information
 * @returns {Promise<object>} Audit data
 */
async function fetchAuditRatio() {
    const query = `
        query {
            user {
                totalUp
                totalDown
                auditRatio
            }
        }
    `;
    
    const data = await executeGraphQLQuery(query);
    return data.user && data.user.length > 0 ? data.user[0] : null;
}

/**
 * Fetch project results
 * @returns {Promise<Array>} Project results
 */
async function fetchProjectResults() {
    const query = `
        query {
            result(
                order_by: { createdAt: desc }
            ) {
                grade
                path
                createdAt
                object {
                    name
                    type
                }
            }
        }
    `;
    
    const data = await executeGraphQLQuery(query);
    return data.result || [];
}

/**
 * Fetch progress data
 * @returns {Promise<Array>} Progress data
 */
async function fetchProgressData() {
    const query = `
        query {
            progress(
                order_by: { createdAt: desc }
            ) {
                grade
                path
                createdAt
                object {
                    name
                    type
                }
            }
        }
    `;
    
    const data = await executeGraphQLQuery(query);
    return data.progress || [];
}

/**
 * Fetch all profile data at once
 * @returns {Promise<object>} All profile data
 */
async function fetchAllProfileData() {
    try {
        const [userInfo, xpTransactions, auditData, results, progress] = await Promise.all([
            fetchUserInfo(),
            fetchXPTransactions(),
            fetchAuditRatio(),
            fetchProjectResults(),
            fetchProgressData()
        ]);
        
        return {
            userInfo,
            xpTransactions,
            auditData,
            results,
            progress
        };
    } catch (error) {
        console.error('Error fetching profile data:', error);
        throw error;
    }
}

// Export functions for use in other modules
window.GraphQL = {
    fetchUserInfo,
    fetchXPTransactions,
    fetchAuditRatio,
    fetchProjectResults,
    fetchProgressData,
    fetchAllProfileData
};
