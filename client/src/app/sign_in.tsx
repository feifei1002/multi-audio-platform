import SignInScreen from '@/components/signin';
import { useRouter } from 'expo-router';

export default function SignInRoute() {
  const router = useRouter();
  return (
    <SignInScreen
      onNavigateToSignUp={() => router.push('/sign_up')}
      onSignInSuccess={() => router.replace('/(app)')}
    />
  );
}