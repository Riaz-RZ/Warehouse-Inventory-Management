# 📦 Warehouse Inventory Management System

**Warehouse Inventory Management System** is a full-stack web application designed to simplify warehouse operations. It helps administrators and staff manage products, track stock movements, handle inventory transfers, and monitor stock levels through a user-friendly dashboard.

## ✨ Features

- 🔐 **User Authentication** — Provide a login flow for authorized users.
- 👥 **Role-Based Access** — Support separate Admin and Staff roles.
- 📦 **Product Management** — Add new products and browse existing inventory.
- 📥 **Stock-In Management** — Record incoming stock and update inventory quantities.
- 📤 **Stock-Out Management** — Record outgoing stock while preventing inventory quantities from becoming negative.
- 🔄 **Stock Transfer** — Manage inventory transfers between supported locations or stock records.
- 📊 **Dashboard** — Access inventory management features from a central interface.
- 👤 **User Profile Management** — View and manage profile information, including avatar uploads where configured.
- 📱 **Responsive Interface** — Use the application across different screen sizes with a React and Tailwind CSS interface.

## 🛠️ Technologies Used

| **Technology** | **Purpose** |
|---|---|
| [React](https://react.dev/) | Component-based user interface |
| [Vite](https://vite.dev/) | Frontend development server and build tool |
| [Tailwind CSS](https://tailwindcss.com/) | Responsive styling |
| [Node.js](https://nodejs.org/) | JavaScript runtime for the backend |
| [Express.js](https://expressjs.com/) | Backend server and API development |
| [MongoDB](https://www.mongodb.com/) | Database for application data |
| [JSON Web Token (JWT)](https://jwt.io/) | Token-based authentication, where configured |
| [bcrypt](https://www.npmjs.com/package/bcrypt) | Password hashing |
| [Multer](https://www.npmjs.com/package/multer) | File uploads, such as profile avatars where configured |

## 🚀 Getting Started

Follow these steps to run the Warehouse Inventory Management System locally.

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/)
- npm, included with Node.js
- [MongoDB](https://www.mongodb.com/) or a MongoDB Atlas account
- [Git](https://git-scm.com/)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/Riaz-RZ/Warehouse-Inventory-Management.git
```

**2. Navigate to the project directory**

```bash
cd Warehouse-Inventory-Management
```

**3. Install dependencies**

If your project has separate `frontend` and `backend` directories, install dependencies in both.

Frontend:

```bash
cd frontend
npm install
```

Backend, in a separate terminal:

```bash
cd backend
npm install
```

If your project uses different folder names, run `npm install` in the directories containing the relevant `package.json` files.

**4. Configure environment variables**

Create a `.env` file in the backend directory and add the variables required by your application. For example:

```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
```

Use the exact environment variable names expected by your backend code. Never commit real credentials, secrets, or `.env` files to GitHub.

**5. Start the backend server**

From the backend directory, run the development script configured in its `package.json`. For example:

```bash
npm run dev
```

**6. Start the frontend**

Open a separate terminal, navigate to the frontend directory, and run:

```bash
npm run dev
```

**7. Open the application**

Check the terminal output for the frontend URL. A typical Vite development server runs at:

[http://localhost:5173](http://localhost:5173)

The backend API uses the port configured in your environment.

## 📁 Project Structure

The following is an example structure. Adjust the folder names to match your actual repository.

```text
Warehouse-Inventory-Management/
├── frontend/
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   └── ...             # Other frontend modules
│   └── package.json
├── backend/
│   ├── ...                 # API routes, controllers, and models
│   ├── .env                # Local environment variables
│   └── package.json
├── .gitignore
└── README.md
```

## 🔄 Typical Workflow

1. 🔐 Log in with an authorized account.
2. 📊 Open the dashboard.
3. 📦 Add new products or browse the existing inventory.
4. 📥 Record incoming stock using **Stock In**.
5. 📤 Record outgoing stock using **Stock Out**.
6. 🔄 Manage inventory using **Stock Transfer**.
7. 👤 View or update profile information.

## 🎯 Project Goal

The goal of this project is to make warehouse inventory operations easier to manage through a centralized application. It focuses on practicing full-stack development while implementing essential workflows for product management, stock tracking, and user access.

## 🔮 Future Improvements

- 🚨 Low-stock notifications and alerts
- 🔎 Product search, filtering, and pagination
- 📈 Inventory reports and stock movement analytics
- 🧾 Detailed inventory activity and audit history
- 🏢 Multiple warehouse and location management
- 🧪 Automated testing for frontend and backend functionality
- 📚 API documentation and improved error handling

## 👨‍💻 Developer

Developed by **Riazul Islam** as a hands-on project to practice full-stack web development.

- 🐙 GitHub: [@Riaz-RZ](https://github.com/Riaz-RZ)
- 📂 Repository: [Warehouse Inventory Management System](https://github.com/Riaz-RZ/Warehouse-Inventory-Management)

---

⭐ If you find this project interesting, consider giving the repository a star on GitHub.

