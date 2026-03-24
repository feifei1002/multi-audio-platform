import SignUpScreen from '@/components/signup';
import { useRouter } from 'expo-router';

export default function SignUpRoute() {
  const router = useRouter();
  return (
    <SignUpScreen
      onNavigateToSignIn={() => router.push('/sign_in')}
    />
  );
}