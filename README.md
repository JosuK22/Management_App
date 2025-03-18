# User Management & Task API

This API handles user roles, permissions, and task management.

## 📌 Roles & Permissions
- **SuperAdmin** - Full control over users and tasks.
- **Admin** - Can manage tasks and view all tasks.
- **Employee** - Can view assigned tasks and update task status.

---

## 🚀 Setup

### 1️⃣ Clone the repository:
```sh
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### 2️⃣  Install dependencies:
```sh
npm install
```

### 3️⃣  Configure Environment Variables in backend :
```sh
DATABASE_URL=postgres://postgres:USER_NAME@localhost:5432/DATABASE_NAME
JWT_SECRET=YOUR_SECRET_KEY
EMAIL_USER=YOUR_EMAIL_ID
EMAIL_PASSWORD=YOUR_APP_PASSWORD
FRONTEND_URL=http://localhost:5173
PORT=5000
```
### 4️⃣ Start the server:
```sh
node server.js
```

## 📌 API Endpoints

### 🔐 Authentication

| Method  | Endpoint              | Access      | Description |
|---------|----------------------|------------|-------------|
| **POST** | `/login` | All Users | Login (Returns JWT token) |
| **POST** | `/forgot-password` | All Users | Sends password reset email |
| **POST** | `/reset-password/:token` | All Users | Resets user password |

---

### 👥 User Management

| Method  | Endpoint              | Access      | Description |
|---------|----------------------|------------|-------------|
| **POST** | `/add-user` | SuperAdmin | Add an Admin or Employee |
| **DELETE** | `/delete-user/:id` | SuperAdmin | Delete an Admin or Employee |
| **PUT** | `/promote-admin/:id` | SuperAdmin | Promote an Admin to SuperAdmin |
| **PUT** | `/promote-employee/:id` | SuperAdmin | Promote an Employee to Admin |
| **GET** | `/users` | SuperAdmin | Get all Admins & Employees |
| **PUT** | `/users/:id` | SuperAdmin | Update user email/password |

---

### 📋 Task Management

| Method  | Endpoint              | Access         | Description |
|---------|----------------------|---------------|-------------|
| **POST** | `/tasks` | SuperAdmin, Admin | Create a new task |
| **PUT** | `/tasks/:id` | SuperAdmin, Admin | Update a task |
| **DELETE** | `/tasks/:id` | SuperAdmin, Admin | Delete a task |
| **GET** | `/tasks` | All Users | View tasks (Admins see all, Employees see assigned tasks) |
| **PATCH** | `/tasks/:id/status` | Employee | Update task status |

---

🔑 **Note:**  
- Include `Authorization: Bearer <token>` in headers for protected requests.  
- **SuperAdmin** manages users & tasks.  
- **Admins** manage tasks & view all tasks.  
- **Employees** can only update their assigned task status.  
