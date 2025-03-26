# Backend API Endpoints and Details

This API handles user roles, permissions, and task management.

## 📌 Roles & Permissions
- **SuperAdmin** - Full control over users and tasks.
- **Admin** - Can manage tasks and view all tasks.
- **Employee** - Can view assigned tasks and update task status.

---

## 🚀 Setup

### 1️⃣ Clone the repository:
```sh
git clone https://github.com/JosuK22/Management_App
cd Management_App
```

### 2️⃣  Install dependencies:
```sh
npm install
```

### 3️⃣  Configure Environment Variables in backend :
```sh
DATABASE_URL=postgres://USER_NAME:DB_PASSWORD@localhost:5432/DATABASE_NAME
JWT_SECRET=YOUR_SECRET_KEY
EMAIL_USER=YOUR_EMAIL_ID
EMAIL_PASSWORD=YOUR_APP_PASSWORD
FRONTEND_URL=http://localhost:5173
PORT=5000
DB_USERNAME=YOUR_USER_NAME
DB_PASSWORD=YOUR_PASSWORD
DB_NAME=NAME_OF_YOUR_DB
DB_HOST=localhost
```
### 4️⃣ Start the server:
```sh
node server.js
```

## 📌 API Endpoints

### 🔐 Authentication

| Method  | Endpoint              | Access      | Description |
|---------|----------------------|------------|-------------|
| **POST** | `/api/auth/login` | All Users | Login (Returns JWT token) |
| **POST** | `/api/auth/forgot-password` | All Users | Sends password reset email |
| **POST** | `/api/auth/reset-password/:token` | All Users | Resets user password |

---

### 👥 User Management

| Method  | Endpoint              | Access      | Description |
|---------|----------------------|------------|-------------|
| **POST** | `/api/users/add-user` | SuperAdmin | Add an Admin or Employee |
| **DELETE** | `/api/users/delete-user/:id` | SuperAdmin | Delete an Admin or Employee |
| **PUT** | `/api/users/promote-admin/:id` | SuperAdmin | Promote an Admin to SuperAdmin |
| **PUT** | `/api/users/promote-employee/:id` | SuperAdmin | Promote an Employee to Admin |
| **GET** | `/api/users/users` | SuperAdmin | Get all Admins & Employees |
| **PUT** | `/users/:id` | SuperAdmin | Update user email/password |


---

### 📋 Task Management

| Method  | Endpoint              | Access         | Description |
|---------|----------------------|---------------|-------------|
| **POST** | `/api/tasks/` | SuperAdmin, Admin | Create a new task |
| **PUT** | `/api/tasks/:id` | SuperAdmin, Admin | Update a task |
| **DELETE** | `/api/tasks/:id` | SuperAdmin, Admin | Delete a task |
| **GET** | `/api/tasks` | All Users | View tasks (Admins see all, Employees see assigned tasks) |
| **PATCH** | `/api/tasks/:id/status` | Employee | Update task status |

---
### 💼 Client Management

| Method  | Endpoint              | Access         | Description |
|---------|----------------------|---------------|-------------|
| **POST** | `/api/clients/add-client` | SuperAdmin, Admin | Create a new client |
| **GET** | `/api/clients/clients` | SuperAdmin, Admin | Fetch all clients |
| **GET** | `/api/clients/clients/:id` | SuperAdmin, Admin | Fetch a single client |
| **PUT** | `/api/clients/clients/:id` | SuperAdmin, Admin | Update single client|
| **DELETE** | `/api/clients/clients/:id` | SuperAdmin, Admin  | Delete a client |

---

## 🗄️ Database Table Names
- **Clients** - Details of Clients.
- **Users** - Details of every users.
- **Tasks** - Details of every tasks.

---

# Task Management API

## Endpoints and Expected Request Body Formats

### 1. Create Task (Super Admin & Admin)
**Endpoint:** `POST /tasks`

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "employee_name": "John Doe",
  "due_date": "2025-03-25",
  "requirements": "Laptop, Internet",
  "status": "Pending",
  "content": "Complete the client report",
  "client_name": "ABC Corp",
  "description": "Prepare the Q1 financial report",
  "priority": "High"
}
```

**Response:**
```json
{
  "message": "Task created successfully",
  "task": { /* task object */ }
}
```

---

### 2. Get Tasks
**Endpoint:** `GET /tasks`

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "tasks": [
    {
      "id": 1,
      "employee_name": "John Doe",
      "due_date": "2025-03-23",
      "requirements": "Laptop, Internet",
      "status": "Pending",
      "content": "Complete the client report",
      "client_name": "ABC Corp",
      "description": "Prepare the Q1 financial report",
      "priority": "High"
    }
  ]
}
```

*(Employees see tasks assigned to them, while Super Admins & Admins see all tasks.)*

---

### 3. Update Task
**Endpoint:** `PUT /tasks/:id`

**Headers:**
- `Authorization: Bearer <token>`

**Request Body (Super Admin & Admin):**
```json
{
  "status": "Completed",
  "priority": "Medium",
  "description": "Updated task details"
}
```

**Request Body (Employee - Can Only Update Status):**
```json
{
  "status": "In Progress"
}
```

**Response:**
```json
{
  "message": "Task updated successfully",
  "task": { /* updated task object */ }
}
```

---

### 4. Delete Task (Super Admin & Admin)
**Endpoint:** `DELETE /tasks/:id`

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Task deleted successfully"
}
```

*(Only Super Admins & Admins can delete tasks.)*

---

# User Management API

This API allows SuperAdmin users to manage Admins, Employees, and Clients.

## Endpoints

### 1. Add a New User (Admin or Employee)
**Endpoint:** `POST /users`
**Access:** SuperAdmin

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "johndoe@example.com",
  "password": "securepassword",
  "role": "admin" // or "employee"
}
```

**Response:**
```json
{
  "message": "User added successfully."
}
```

---

### 2. Delete a User
**Endpoint:** `DELETE /users/:id`
**Access:** SuperAdmin

**Response:**
```json
{
  "message": "User deleted successfully."
}
```

---

### 3. Promote an Admin to SuperAdmin
**Endpoint:** `PATCH /users/promote/:id`
**Access:** SuperAdmin

**Response:**
```json
{
  "message": "Admin promoted to SuperAdmin successfully."
}
```

---

### 4. Get All Users
**Endpoint:** `GET /users`
**Access:** SuperAdmin

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "johndoe@example.com",
      "role": "admin"
    }
  ]
}
```

---

### 5. Update User Details (Email or Password)
**Endpoint:** `PATCH /users/:id`
**Access:** SuperAdmin

**Request Body (one or both fields required):**
```json
{
  "email": "newemail@example.com",
  "password": "newsecurepassword"
}
```

**Response:**
```json
{
  "message": "User updated successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "newemail@example.com",
    "role": "admin"
  }
}
```

---

### 6. Promote an Employee to Admin
**Endpoint:** `PATCH /users/promote-employee/:id`
**Access:** SuperAdmin

**Response:**
```json
{
  "message": "Employee promoted to Admin successfully."
}
```

---

# Client Management API Endpoints

## 1. Add a New Client
- **URL**: `/api/clients/add-client`
- **Method**: `POST`
- **Description**: Adds a new client. Accessible only by users with the `admin` or `superadmin` role.
  
### Request Body:
```json
{
  "client_name": "Client Name",
  "phone_number": "1234567890",
  "requirements": {
    "reel": 10,
    "video": 5,
    "poster": 3
  },
  "package": "Standard",
  "description": "Detailed description of the client"
}
```
**Response:**
```json
{
  "message": "Client added successfully."
}
```

## 2. Get All Clients
- **URL**: `/api/clients/clients`
- **Method**: `GET`
- **Description**: Fetches all clients. Accessible only by users with the admin or superadmin role.
  
### Response Body:
```json
{
  "clients": [
    {
      "id": 1,
      "client_name": "Client Name",
      "phone_number": "1234567890",
      "requirements": {
        "reel": 10,
        "video": 5,
        "poster": 3
      },
      "package": "Standard",
      "description": "Client description"
    },
  ]
}
```

## 3. Get a Single Client by ID
- **URL**: `/api/clients/clients/:id`
- **Method**: `GET`
- **Description**: Fetch a single client by its ID. Accessible only by users with the admin or superadmin role.
  
### Response Body:
```json
{
  "client": {
    "id": 1,
    "client_name": "Client Name",
    "phone_number": "1234567890",
    "requirements": {
      "reel": 10,
      "video": 5,
      "poster": 3
    },
    "package": "Standard",
    "description": "Client description"
  }
}
```

## 4. Update Client Details
- **URL**: `/api/clients/clients/:id`
- **Method**: `PUT`
- **Description**: Updates the details of a client. Accessible only by users with the admin or superadmin role.
  
### Request Body:
```json
{
  "client_name": "Updated Client Name",
  "phone_number": "0987654321",
  "requirements": {
    "reel": 12,
    "video": 7,
    "poster": 4
  },
  "package": "Premium",
  "description": "Updated description of the client"
}
```
**Response:**
```json
{
  "message": "Client updated successfully."
}
```
## 5. Delete a Client
- **URL**: `/api/clients/clients/:id`
- **Method**: `DELETE`
- **Description**: Deletes a client. Accessible only by users with the admin or superadmin role.

**Response:**
```json
{
  "message": "Client deleted successfully."
}
```

🔑 **Note:**  
- Include `Authorization: Bearer <token>` in headers for protected requests.  
- **SuperAdmin** manages users & tasks.  
- **Admins** manage tasks & view all tasks.  
- **Employees** can only update their assigned task status.  
