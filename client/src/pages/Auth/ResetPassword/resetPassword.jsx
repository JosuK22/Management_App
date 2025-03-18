import { useParams, useNavigate } from 'react-router-dom';
//import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '../../../components/ui/Button';
import FormInput from '../../../components/form/FormInput';
import { BACKEND_URL } from '../../../utils/connection.js';
import styles from './reset.module.css';
import { Eye, Lock } from 'lucide-react';
//import Form from '../Form';

// Validation schema for the reset password form
const passwordSchema = yup.object({
  password: yup
    .string()
    .required('* Password is required')
    .min(6, '* Password must be at least 6 characters'),
  confirmPassword: yup
    .string()
    .required('* Confirm password is required')
    .oneOf([yup.ref('password'), null], '* Passwords must match'),
}).required();

export default function ResetPassword() {
  const { token } = useParams();  // Get reset token from URL
  const navigate = useNavigate();
  
  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    //setError,
  } = useForm({
    resolver: yupResolver(passwordSchema),
  });

  // Form submission handler
  const onSubmit = async (data) => {
    try {
      const res = await fetch(BACKEND_URL + `api/auth/reset-password/${token}`, {
        method: 'POST',
        body: JSON.stringify({ password: data.password }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.message || 'Something went wrong');
      }

      toast.success('Password has been reset successfully!');
      navigate('/auth/');  // Redirect to login after success
    } catch (error) {
      toast.error(error.message || 'Failed to reset password');
    }
  };

  return (

    <div className={styles.container}>
    <h2>Reset your password</h2>
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      
      <FormInput
        label="password"
        placeholder="Enter your new password"
        register={register}
        error={errors.password}
        type="password"
        mainIcon={<Lock />}
        secondaryIcon={<Eye />}
      />
      <FormInput
        label="confirmPassword"
        placeholder="Confirm your new password"
        register={register}
        error={errors.confirmPassword}
        type="password"
        mainIcon={<Lock />}
        secondaryIcon={<Eye />}
      />
      <Button disabled={isSubmitting}>
        {isSubmitting ? 'Resetting...' : 'Reset Password'}
      </Button>
    </form>

    </div>
  );
}
