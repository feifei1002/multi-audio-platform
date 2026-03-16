import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

export default function App() {
  const [message, setMessage] = useState("Trying to connect...");

  useEffect(() => {
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/`)
      .then(res => res.json())
      .then(data => setMessage(data.status))
      .catch(err => setMessage("Connection Failed: " + err.message));
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>{message}</Text>
    </View>
  );
}