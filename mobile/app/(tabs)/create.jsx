import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import styles from "../../assets/styles/create.styles";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore.js";
import COLORS from "../../constants/colors";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { API_URL } from "../../constants/api.js";

export default function Create() {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [rating, setRating] = useState(3);
  const [image, setImage] = useState(null); // displays the selected image
  const [imageBase64, setImageBase64] = useState(null); // translates the images to text
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { token } = useAuthStore();

  const pickImage = async () => {
    try {
      // request for permission
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Denied",
            "We need camera roll permissions in order to upload your image"
          );
          return;
        }
      }
      // launch the image library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.3, // Reduced quality for smaller base64 representation
        base64: true, // translates the image to text format
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);

        // if base64 is provided use it
        if (result.assets[0].base64) {
          setImageBase64(result.assets[0].base64);
        } else {
          // Convert it to base64
          const base64 = await FileSystem.readAsStringAsync(
            result.assets[0].uri,
            {
              encoding: FileSystem.EncodingType.Base64,
            }
          );
          setImageBase64(base64);
        }
      }
    } catch (error) {
      console.log("Error when picking image", error);
      Alert.alert("Error", "There was a problem when selecting your image");
    }
  };

  const handleSubmit = async () => {
    console.log("Form state:", {
      hasTitle: Boolean(title),
      hasCaption: Boolean(caption),
      hasImage: Boolean(image),
      hasImageBase64: Boolean(imageBase64),
      rating,
    });

    if (!title) {
      Alert.alert("Error", "Please enter a book title");
      return;
    }
    if (!caption) {
      Alert.alert("Error", "Please enter a caption");
      return;
    }
    if (!image || !imageBase64) {
      Alert.alert("Error", "Please select an image");
      return;
    }

    try {
      setLoading(true);

      // Getting file extension from URI or default to JPEG
      const uriParts = image.split(".");
      const fileType = uriParts[uriParts.length - 1];
      const imageType = fileType
        ? `image/${fileType.toLowerCase()}`
        : "image/jpeg";

      // Properly format the data URL (no space after semicolon)
      const imageDataUrl = `data:${imageType};base64,${imageBase64}`;

      // Log request details (without full image data for brevity)
      console.log("Making request to:", `${API_URL}/api/books`);
      console.log("Request content:", {
        title,
        caption,
        rating: rating.toString(),
        imagePrefix: imageDataUrl.substring(0, 30) + "...",
        imageLength: imageBase64.length,
      });

      // Create the request body object
      const requestBody = {
        title,
        caption,
        rating: rating.toString(),
        image: imageDataUrl,
      };

      // Send the request
      const response = await fetch(`${API_URL}/api/books`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // Check response status first
      console.log("Response status:", response.status);

      // Get response as text first to diagnose potential issues
      const responseText = await response.text();
      console.log(
        "Response text (first 100 chars):",
        responseText.substring(0, 100)
      );

      // Try to parse as JSON if possible
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse response as JSON:", e);
        throw new Error(
          `Server error (${response.status}): Not a valid JSON response`
        );
      }

      if (!response.ok)
        throw new Error(data.message || `Server error: ${response.status}`);

      Alert.alert("Success", "Your book recommendation has been posted!");
      setTitle("");
      setCaption("");
      setRating(3);
      setImage(null);
      setImageBase64(null);
      router.push("/");
    } catch (error) {
      console.error("Error creating post", error);
      Alert.alert("Error", error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Book rating function
  const renderRatingPicker = () => {
    const stars = [];

    for (let i = 0; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={styles.starButton}
        >
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={32}
            color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          />
        </TouchableOpacity>
      );
    }

    return <View style={styles.ratingContainer}>{stars}</View>;
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        style={styles.scrollViewStyle}
      >
        <View style={styles.card}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Add book recommendation</Text>
            <Text style={styles.subtitle}>
              Post and share your favorite books with the world
            </Text>
          </View>
          <View style={styles.form}>
            {/* BOOK TITLE */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Book Title</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="book-outline"
                  size={20}
                  color={COLORS.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter book title"
                  placeholderTextColor={COLORS.placeholderText}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
            </View>
            {/* BOOK RATING */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Your rating</Text>
              {renderRatingPicker()}
            </View>
            {/* BOOK IMAGE */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Book Image</Text>
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.previewImage} />
                ) : (
                  <View style={styles.placeholderContainer}>
                    <Ionicons
                      name="image-outline"
                      size={40}
                      color={COLORS.textSecondary}
                    />
                    <Text style={styles.placeholderText}>
                      Tap to select an image
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
            {/* CAPTION */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Caption</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Write your thoughts or reviews about this book here"
                placeholderTextColor={COLORS.placeholderText}
                value={caption}
                onChangeText={setCaption}
                multiline
              />
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={20}
                    color={COLORS.white}
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>Post</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
