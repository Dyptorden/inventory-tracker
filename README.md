# Inventory Tracker

A modern, real-time inventory management system built with React and Firebase. Track items, assign them to receivers, and manage your inventory with an intuitive drag-and-drop interface.

![Inventory Tracker Demo](https://img.shields.io/badge/Status-Live-brightgreen)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Firebase](https://img.shields.io/badge/Firebase-10.7.1-orange)

## 🚀 Live Demo

[View Live Application](https://dyptorden.github.io/inventory-tracker)

## ✨ Features

### Core Functionality
- **Real-time Synchronization** - Changes appear instantly across all users
- **Drag & Drop Interface** - Intuitive item assignment to receivers
- **Cloud Storage** - Data persists across sessions and devices
- **Responsive Design** - Works on desktop, tablet, and mobile

### Inventory Management
- ✅ Add, edit, and delete inventory items
- ✅ Multiple item types (HMI, Battery, Motor, Range Extender, Radar)
- ✅ Unique serial number validation
- ✅ Sortable item lists (by serial number or type)

### Receiver Management
- ✅ Add, edit, and delete receivers
- ✅ Email validation and uniqueness checking
- ✅ Click-to-email functionality
- ✅ Visual assignment tracking

### User Experience
- ✅ Loading states and error handling
- ✅ Keyboard shortcuts (Enter, Escape)
- ✅ Auto-focus for accessibility
- ✅ Visual feedback for all interactions

## 🛠️ Tech Stack

- **Frontend**: React 18.2.0
- **Backend**: Firebase Firestore
- **Deployment**: GitHub Pages
- **Styling**: CSS-in-JS with custom styling
- **Build Tool**: Create React App

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js (version 14 or higher)
- npm or yarn package manager
- A Firebase project (for database functionality)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dyptorden/inventory-tracker.git
   cd inventory-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
    - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
    - Enable Firestore Database
    - Update the Firebase configuration in `src/firebase.js` with your project credentials

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔥 Firebase Configuration

Update `src/firebase.js` with your Firebase project configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### Firestore Security Rules

For development, use these rules in Firebase Console > Firestore > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **Important**: Update security rules for production use!

## 📊 Database Structure

### Collections

**Items Collection (`items`)**
```javascript
{
  id: "auto-generated-id",
  serialNumber: "ABC123",
  type: "HMI",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Receivers Collection (`receivers`)**
```javascript
{
  id: "auto-generated-id",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  assignedItems: [
    {
      serialNumber: "ABC123",
      type: "HMI"
    }
  ],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 🎮 How to Use

### Adding Items
1. Click "Add an item" in the left panel
2. Enter a unique serial number
3. Select the item type from dropdown
4. Click "Add" to save

### Managing Receivers
1. Click "Add Receivers" in the right panel
2. Fill in first name, last name, and email
3. Click "Add" to create receiver

### Assigning Items
1. **Drag and drop** items from the left panel to receiver cards
2. **Click assigned items** to return them to inventory
3. **Click receiver email** to send an email

### Editing & Deleting
- **Click any item or receiver** to see modify/delete options
- Use the popup menu to edit or remove entries

## 🚀 Deployment

This project is configured for GitHub Pages deployment:

```bash
# Build and deploy to GitHub Pages
npm run deploy
```

The deployment configuration is already set up in `package.json`.

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop** (optimal experience)
- **Tablet** (grid layout adapts)
- **Mobile** (stacked layout)

## 🔒 Security Considerations

### Current Setup
- Firebase config values are public (this is normal and safe)
- Database uses test mode rules (open access)
- No user authentication implemented

### Production Recommendations
1. **Implement Firebase Authentication**
2. **Update Firestore Security Rules**
3. **Add user-based data isolation**
4. **Enable audit logging**

Example production security rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run test suite
- `npm run deploy` - Deploy to GitHub Pages

## 🐛 Known Issues

- Items returned to inventory may briefly appear unsorted
- Modal focus management needs improvement on mobile
- Offline functionality limited to browser cache

## 🔮 Future Enhancements

- [ ] User authentication and authorization
- [ ] Multi-tenant support (organizations)
- [ ] Item history and audit trail
- [ ] Barcode scanning integration
- [ ] Email notifications for assignments
- [ ] Advanced search and filtering
- [ ] Data export/import functionality
- [ ] Dark mode theme

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Your Name**
- GitHub: [@dyptorden](https://github.com/dyptorden)
- Project Link: [https://github.com/dyptorden/inventory-tracker](https://github.com/dyptorden/inventory-tracker)

## 🙏 Acknowledgments

- Firebase for providing the backend infrastructure
- React team for the amazing frontend framework
- GitHub Pages for free hosting
- The open-source community for inspiration and tools

---

**Made with ❤️ for efficient inventory management**