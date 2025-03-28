import { Stack } from "expo-router/stack";
import { StyleSheet, Text, View } from "react-native";

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
