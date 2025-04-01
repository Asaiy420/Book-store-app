import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { Image } from "expo-image";
import { useAuthStore } from "../store/authStore.js";
import { useEffect } from "react";

export default function Index() {
  const { user, token, checkAuth, logout } = useAuthStore();
  console.log(user, token);
  useEffect(() => {
    checkAuth();
  }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello {user?.username}</Text>
      <TouchableOpacity onPress={logout}>
        <Text>Logout</Text>
      </TouchableOpacity>

      <Link href="/(auth)/signup">Signup </Link>
      <Link href="/(auth)">Login </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { color: "blue" },
});
