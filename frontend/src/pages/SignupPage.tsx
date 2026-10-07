import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import emblemSrc from '../assets/emblem-icon.jpg';
import { Icon } from '../components/Icon';
import { ApiClientError } from '../services/apiClient';
import { useAuth } from '../features/auth/AuthContext';

export function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await signup(name, email, password);
      navigate('/', { replace: true });
    } catch (error) {
      setErrorMessage(
        error instanceof ApiClientError ? error.displayMessage : 'Something went wrong. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-surface px-gutter-mobile py-10">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-[0_12px_32px_-8px_rgba(50,10,15,0.15)] border border-[rgba(143,112,102,0.15)] p-8">
        <div className="flex flex-col items-center text-center gap-1">
          <div className="h-16 w-16 overflow-hidden rounded-full">
            <img
              src={emblemSrc}
              alt="Band Baaja Baaraat Emblem"
              className="h-full w-full scale-150 object-cover object-[50%_38%]"
            />
          </div>
          <h1 className="text-title-lg text-on-surface font-bold mt-2">Band Baaja Baaraat</h1>
          <p className="text-body-md text-on-surface-variant">Create your wedding planning portal account</p>
        </div>

        <form className="flex flex-col gap-4 mt-6" onSubmit={handleSubmit} noValidate>
          {errorMessage ? (
            <p role="alert" className="text-body-sm text-on-error-container bg-error-container rounded-lg px-3 py-2">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-label-md text-on-surface-variant font-semibold">
              Full Name
            </label>
            <div className="relative">
              <Icon
                name="person"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                style={{ fontSize: 18 }}
              />
              <input
                id="name"
                type="text"
                required
                autoComplete="name"
                placeholder="e.g. Ananya Sharma"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="text-body-md w-full rounded-lg border border-outline-variant bg-surface pl-10 pr-3 py-2.5 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-label-md text-on-surface-variant font-semibold">
              Email Address
            </label>
            <div className="relative">
              <Icon
                name="mail"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                style={{ fontSize: 18 }}
              />
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="e.g. ananya@jaipurwedding.org"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="text-body-md w-full rounded-lg border border-outline-variant bg-surface pl-10 pr-3 py-2.5 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-label-md text-on-surface-variant font-semibold">
              Password
            </label>
            <div className="relative">
              <Icon
                name="lock"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                style={{ fontSize: 18 }}
              />
              <input
                id="password"
                type={isPasswordVisible ? 'text' : 'password'}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="text-body-md w-full rounded-lg border border-outline-variant bg-surface pl-10 pr-10 py-2.5 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                aria-pressed={isPasswordVisible}
                onClick={() => setIsPasswordVisible((visible) => !visible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none p-0 text-on-surface-variant"
              >
                <Icon name={isPasswordVisible ? 'visibility_off' : 'visibility'} style={{ fontSize: 18 }} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="text-label-lg inline-flex items-center justify-center gap-1 bg-primary text-on-primary border-none py-2.5 rounded-lg font-semibold shadow-[0_4px_14px_rgba(164,55,0,0.3)] transition-[background-color,transform] duration-150 hover:bg-primary-container active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
          >
            {isSubmitting ? 'Creating Account…' : 'Create Account'}
            <Icon name="arrow_forward" style={{ fontSize: 18 }} />
          </button>

          <p className="text-body-sm text-center text-on-surface-variant">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
