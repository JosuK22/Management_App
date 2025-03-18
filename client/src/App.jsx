import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AdminLayout from './pages/Admin';
import AuthLayout from './pages/Auth';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import AuthProvider from './store/AuthProvider';
import Board from './pages/Admin/Board';
import ForgotPassword from './pages/Auth/ForgotPassword/forgotPassword';
import ResetPassword from './pages/Auth/ResetPassword/resetPassword';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthProvider>
        <AdminLayout />
      </AuthProvider>
    ),
    children: [
      {
        index: true,
        element: <Board />,
      },
    ],
  },
  {
    path: '/auth',
    element: (
      <AuthProvider>
        <AuthLayout />
      </AuthProvider>
    ),
    children: [
      {
        index: true,
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: 'reset-password/:token', 
        element: <ResetPassword />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
