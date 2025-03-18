import PropTypes from 'prop-types';
import { Text } from '../../components/ui';
import { Link } from 'react-router-dom';
import styles from './Form.module.css';

export default function LoginForm({ title, children, loginError }) {
  return (
    <div className={styles.container}>
      <Text step={7} weight="500">
        {title}
      </Text>

      {children}

      <div className={styles.navigation}>
        {title === 'Login' && loginError ? (
          // LINK TO FORGOT PASSWORD -> LOGIN -> FORGOT PASSWORD
          <div className={styles.navContent}>
            <Text color="#828282">
              Forgot your Password ?{' '}
            </Text>

            <Link to="/auth/forgot-password">
              <Text color="#2C7BE5" style={{ cursor: 'pointer' }}>
                Reset Password
              </Text>
            </Link>
          </div>
        ) : title === 'Login' ? (
          // LINK TO REGISTER -> LOGIN
          <div className={styles.navContent}>
            <Text color="#828282">
              Forgot password?{' '}
            </Text>

            <Link to="/auth/forgot-password">
              <Text color="#2C7BE5" style={{ cursor: 'pointer' }}>
                Forgot Password
              </Text>
            </Link>
          </div>
        ) : title === 'Forgot Password' ? (
          // LINK TO LOGIN -> FORGOT PASSWORD
          <div className={styles.navContent}>
            <Text color="#828282">
              Go back to {' '}
            </Text>

            <Link to="/auth/">
              <Text color="#2C7BE5" style={{ cursor: 'pointer' }}>
                Login
              </Text>
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

LoginForm.propTypes = {
  title: PropTypes.oneOf(['Login', 'Forgot Password']).isRequired,
  children: PropTypes.node,
  loginError: PropTypes.bool,
};
