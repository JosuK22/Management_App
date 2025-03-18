import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as yup from 'yup';
import { useEffect } from 'react';
import { BACKEND_URL } from '../../../utils/connection.js';
import { Mail } from 'lucide-react';
import { useState } from 'react';
import FormInput from '../../../components/form/FormInput';
import Button from '../../../components/ui/Button';
import Form from '../Form';
import styles from './forgotPassword.module.css';

const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
const message = '* This field is required';

const schema = yup
  .object({
    email: yup.string().required(message).matches(emailRegex, { message: 'Email is not valid' }),
  })
  .required();

const defaultValues = {
  email: '',
};

export default function ForgotPassword() {
  const [isSafeToReset, setIsSafeToReset] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues,
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await fetch(
        BACKEND_URL + 'api/auth/forgot-password',
        {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!res.ok) {
        const errJson = await res.json();
        const { errors } = errJson;

        for (const property in errors) {
          setError(property, { type: 'custom', message: errors[property] });
        }

        throw new Error(errJson.message);
      }

      toast.success('Password reset link has been sent to your email!');
      setIsSafeToReset(true);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (!isSafeToReset) return;

    reset(defaultValues); // asynchronously reset your form values
  }, [reset, isSafeToReset]);

  return (
    <Form title="Forgot Password">
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <FormInput
          error={errors.email}
          label="email"
          placeholder={'Email'}
          register={register}
          mainIcon={<Mail />}
        />

        <Button>{isSubmitting ? 'Sending...' : 'Send Reset Link'}</Button>
      </form>
    </Form>
  );
}
