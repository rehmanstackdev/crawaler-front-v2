import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { authService } from '@/services/authService';

export const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email;
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (code.length === 6) {
      void handleSubmit(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  if (!email) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleSubmit = async (otpValue: string) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const { resetToken } = await authService.verifyOtp({ email, otp: otpValue });
      navigate('/reset-password', { state: { resetToken, email } });
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || 'Invalid code'
        : 'Invalid code';
      toast.error(message);
      setCode('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.forgotPassword(email);
      toast.success('A new code was sent if that email exists');
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || 'Could not resend code'
        : 'Could not resend code';
      toast.error(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell
      title="Enter verification code"
      subtitle={
        <>
          We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
        </>
      }
      footer={
        <>
          Wrong email?{' '}
          <Link to="/forgot-password" className="font-semibold text-primary hover:underline">
            Try again
          </Link>
        </>
      }
    >
      <div className="flex flex-col items-center gap-6">
        <InputOTP maxLength={6} value={code} onChange={setCode} disabled={submitting}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>

        <Button
          type="button"
          className="w-full"
          onClick={() => handleSubmit(code)}
          disabled={submitting || code.length < 6}
        >
          {submitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ShieldCheck className="mr-2 h-4 w-4" />
          )}
          Verify
        </Button>

        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="text-xs text-muted-foreground hover:text-foreground hover:underline disabled:opacity-50"
        >
          {resending ? 'Resending…' : 'Resend code'}
        </button>
      </div>
    </AuthShell>
  );
};

export default VerifyOtp;
