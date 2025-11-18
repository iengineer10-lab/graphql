# GraphQL Profile Statistics Viewer

A modern, interactive single-page application for viewing user profile statistics from a GraphQL API. Built with vanilla JavaScript, featuring beautiful SVG graphs and a responsive design.

![GraphQL Profile](https://img.shields.io/badge/GraphQL-E10098?style=flat&logo=graphql&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)

## 🚀 Features

### Authentication
- **Secure Login System**: Basic authentication with base64 encoding
- **JWT Token Management**: Automatic token storage and validation
- **Session Handling**: Persistent login sessions with automatic expiry detection
- **Dual Login Support**: Login with username or email

### Profile Dashboard
- **User Information Display**: View user ID, login, and email
- **Real-time Statistics**:
  - Total XP earned
  - Audit ratio (audits done vs. received)
  - Success rate percentage
  - Total projects completed

### Interactive SVG Graphs
All graphs are created with pure SVG (no external charting libraries):

1. **XP Progress Over Time** (Line Chart)
   - Visualizes XP accumulation over time
   - Smooth animated line drawing
   - Interactive tooltips showing project details
   - Gradient fill under the line

2. **XP by Project** (Bar Chart)
   - Top 15 projects by XP earned
   - Color-coded bars based on XP amount
   - Animated bar growth
   - Hover tooltips with exact values

3. **Audit Ratio** (Donut Chart)
   - Visual representation of audits done vs. received
   - Shows actual ratio in the center
   - Color-coded sections
   - Animated drawing effect

4. **Pass/Fail Ratio** (Pie Chart)
   - Success rate visualization
   - Green for pass, red for fail
   - Percentage display in center
   - Interactive hover states

### Design Features
- **Modern Dark Theme**: Professional dark color scheme
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Smooth Animations**: CSS and SVG animations for better UX
- **Loading States**: Visual feedback during data fetching
- **Error Handling**: User-friendly error messages
- **Accessibility**: Semantic HTML and proper ARIA labels

## 📋 Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Valid credentials for the GraphQL API
- Internet connection to access the API

## 🛠️ Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/almarzooq-ahmed/graph-ql.git
   cd graph-ql
   ```

2. **No build step required!** This is a vanilla JavaScript application.

## 🚀 Usage

### Local Development

1. **Serve the files** using any static file server:

   **Option 1: Python (Python 3)**
   ```bash
   python -m http.server 8000
   ```

   **Option 2: Python (Python 2)**
   ```bash
   python -m SimpleHTTPServer 8000
   ```

   **Option 3: Node.js (npx)**
   ```bash
   npx http-server -p 8000
   ```

   **Option 4: PHP**
   ```bash
   php -S localhost:8000
   ```

2. **Open your browser** and navigate to:
   ```
   http://localhost:8000
   ```

3. **Login** with your credentials:
   - Enter your username or email
   - Enter your password
   - Click "Sign In"

4. **View your profile** with statistics and graphs!

### Production Deployment

#### GitHub Pages

1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Select the branch (usually `main`) and root folder
4. Click Save
5. Your site will be available at `https://yourusername.github.io/graph-ql/`

#### Netlify

1. Create a new site from Git
2. Connect your repository
3. Deploy settings:
   - Build command: (leave empty)
   - Publish directory: (leave as `.` or root)
4. Click Deploy

#### Vercel

1. Import your Git repository
2. Configure:
   - Framework Preset: Other
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
3. Deploy

#### Any Static Host

Simply upload all files to your web host's public directory:
- `index.html`
- `profile.html`
- `styles.css`
- `auth.js`
- `graphql.js`
- `profile.js`
- `graphs.js`
- `README.md`

## 🏗️ Project Structure

```
graph-ql/
│
├── index.html          # Login page
├── profile.html        # Profile dashboard page
├── styles.css          # Global styles and responsive design
├── auth.js             # Authentication logic and JWT handling
├── graphql.js          # GraphQL query functions
├── profile.js          # Profile page initialization and data display
├── graphs.js           # SVG graph generation functions
└── README.md           # This file
```

## 🔧 Configuration

### API Domain

The API domain is set in both `auth.js` and `graphql.js`:

```javascript
const API_DOMAIN = 'learn.reboot01.com';
```

To use a different domain, update this constant in both files.

### API Endpoints

1. **Authentication**:
   ```
   POST https://{DOMAIN}/api/auth/signin
   Authorization: Basic {base64(username:password)}
   ```

2. **GraphQL**:
   ```
   POST https://{DOMAIN}/api/graphql-engine/v1/graphql
   Authorization: Bearer {JWT_TOKEN}
   ```

## 📊 GraphQL Queries

### User Info
```graphql
query {
  user {
    id
    login
    email
  }
}
```

### XP Transactions
```graphql
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
```

### Audit Ratio
```graphql
query {
  user {
    totalUp
    totalDown
    auditRatio
  }
}
```

### Project Results
```graphql
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
```

### Progress Data
```graphql
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
```

## 🎨 Customization

### Color Scheme

Edit CSS variables in `styles.css`:

```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --success-color: #48bb78;
    --error-color: #f56565;
    /* ... more colors */
}
```

### Graph Appearance

Modify graph functions in `graphs.js`:
- Adjust margins, dimensions
- Change colors
- Modify animation timings
- Customize tooltip content

## 🔐 Security Features

- **JWT Token Validation**: Tokens are validated before storage
- **Automatic Session Expiry**: Expired tokens trigger automatic re-login
- **Input Sanitization**: User inputs are validated before submission
- **Error Handling**: All API calls wrapped in try-catch blocks
- **Secure Storage**: Tokens stored in localStorage (consider httpOnly cookies for production)

## 🐛 Troubleshooting

### Login Issues

**Problem**: "Invalid credentials" error
- **Solution**: Verify your username/email and password
- Check if the API domain is correct

**Problem**: "Network error"
- **Solution**: Check your internet connection
- Verify the API is accessible
- Check browser console for CORS errors

### Profile Loading Issues

**Problem**: Profile shows "No data available"
- **Solution**: Ensure you have completed projects with XP
- Check if the JWT token is valid
- Verify GraphQL API permissions

**Problem**: Graphs not displaying
- **Solution**: Ensure you have data for that graph type
- Check browser console for JavaScript errors
- Try refreshing the page

### CORS Issues

If you encounter CORS errors:
1. The API must allow requests from your domain
2. For local development, use a proxy or browser extension
3. Contact your API administrator to whitelist your domain

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Ahmed Almarzooq**
- GitHub: [@almarzooq-ahmed](https://github.com/almarzooq-ahmed)

## 🙏 Acknowledgments

- Built as a project for 01 Edu learning platform
- Inspired by modern dashboard designs
- Uses GraphQL for efficient data fetching

## 📸 Screenshots

### Login Page
![Login Page](docs/login-screenshot.png)
*Modern login interface with clean design*

### Profile Dashboard
![Profile Dashboard](docs/profile-screenshot.png)
*Comprehensive statistics and interactive graphs*

---

**Note**: Replace `((DOMAIN))` in the code with your actual API domain (e.g., `learn.reboot01.com`) before deployment.

Made with ❤️ by Ahmed Almarzooq