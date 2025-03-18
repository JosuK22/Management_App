import { Toaster } from 'react-hot-toast';
import { Outlet, useNavigate } from 'react-router-dom';
import { useContext, useEffect } from 'react';

import { AuthContext } from '../../store/AuthProvider';

import styles from './index.module.css';

export default function AuthLayout() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: '#fff',
            color: 'black',
          },
        }}
      />

      <main className={styles.container}>

        <div className={styles.outlet}>
          <Outlet />
        </div>

      </main>
    </>
  );
}
