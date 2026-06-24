import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
} from "react-native";
import { db, authi } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { BLUE_400, BLUE_500, GRAY_BG, GRAY_MID, GRAY_TXT, DARK, WHITE } from '../../constants/colours';

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dfdwq8ntm/image/upload";
const UPLOAD_PRESET = "THE_UNSIGNED_PRESET";

interface FieldProps {
  label: string;
  iconName: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: any;
}

const Field = ({ label, iconName, value, onChangeText, placeholder, multiline = false }: FieldProps) => (
  <View style={{ gap: 8 }}>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <Ionicons name={iconName as any} size={15} color={BLUE_400} />
      <Text style={{ fontSize: 13, fontWeight: "700", color: DARK }}>
        {label}
      </Text>
    </View>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      multiline={multiline}
      style={{
        backgroundColor: WHITE,
        borderWidth: 1.5,
        borderColor: value ? BLUE_400 : GRAY_MID,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: multiline ? 14 : 0,
        height: multiline ? 96 : 52,
        fontSize: 14,
        color: DARK,
        textAlignVertical: multiline ? "top" : "center",
      }}
    />
  </View>
);

const Post = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [selected, setSelected] = useState<"lost" | "found">("lost");
  const [pickedImage, setPickedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [posted, setPosted] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Allow access to your photo library to add an image.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled) setPickedImage(result.assets[0].uri);
  };

  const uploadImageToCloudinary = async (uri: string) => {
    const formData = new FormData();
    formData.append("file", { uri, type: "image/jpeg", name: "photo.jpg" } as any);
    formData.append("upload_preset", UPLOAD_PRESET);
    const res = await axios.post(CLOUDINARY_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.secure_url;
  };

  const handlePost = async () => {
    if (!name.trim() || !description.trim() || !location.trim() || !pickedImage) {
      Alert.alert("Missing details", "Please fill in all fields and add a photo before posting.");
      return;
    }
    setUploading(true);
    try {
      const downloadURL = await uploadImageToCloudinary(pickedImage);
      await addDoc(collection(db, "items"), {
        name: name.trim(),
        description: description.trim(),
        location: location.trim(),
        type: selected,
        image: downloadURL,
        ownerUid: authi.currentUser?.uid ?? "",
        createdAt: new Date(),
      });
      setPosted(true);
      setName(""); setDescription(""); setLocation("");
      setSelected("lost"); setPickedImage(null);
      setTimeout(() => setPosted(false), 2500);
    } catch (error) {
      console.error("Error posting item:", error);
      Alert.alert("Upload failed", "Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const isLost = selected === "lost";
  const allFilled = !!(name && description && location && pickedImage);
  const filledCount = [!!name, !!description, !!location, !!pickedImage].filter(Boolean).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: WHITE }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 130 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── Blue Header (matches index page) ── */}
          <View
            style={{
              backgroundColor: BLUE_400,
              paddingTop: Platform.OS === "android" ? 48 : 16,
              paddingBottom: 28,
              paddingHorizontal: 20,
              borderBottomLeftRadius: 36,
              borderBottomRightRadius: 36,
            }}
          >
            {/* Top row */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{
                  height: 44, width: 44, borderRadius: 22,
                  backgroundColor: WHITE, alignItems: "center", justifyContent: "center",
                }}>
                  <Ionicons name="add-circle" size={22} color={BLUE_400} />
                </View>
                <View>
                  <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>New Report</Text>
                  <Text style={{ color: WHITE, fontSize: 18, fontWeight: "700" }}>
                    {isLost ? "Report Lost Item" : "Report Found Item"}
                  </Text>
                </View>
              </View>

              {/* Progress badge */}
              <View style={{
                height: 44, width: 44, borderRadius: 22,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center", justifyContent: "center",
              }}>
                <Text style={{ color: WHITE, fontSize: 13, fontWeight: "700" }}>
                  {filledCount}/4
                </Text>
              </View>
            </View>

            {/* Tab toggle — same style as index */}
            <View style={{
              flexDirection: "row",
              backgroundColor: "rgba(255,255,255,0.25)",
              borderRadius: 50,
              padding: 4,
            }}>
              {(["lost", "found"] as const).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setSelected(tab)}
                  activeOpacity={0.8}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    paddingVertical: 11,
                    borderRadius: 50,
                    backgroundColor: selected === tab ? WHITE : "transparent",
                  }}
                >
                  <Ionicons
                    name={tab === "lost" ? "search" : "checkmark-circle"}
                    size={15}
                    color={selected === tab ? BLUE_400 : WHITE}
                  />
                  <Text style={{
                    fontWeight: "700",
                    fontSize: 14,
                    color: selected === tab ? BLUE_400 : WHITE,
                  }}>
                    {tab === "lost" ? "Lost Item" : "Found Item"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ paddingHorizontal: 20, paddingTop: 24, gap: 16 }}>

            {/* ── Form Card ── */}
            <View style={{
              backgroundColor: GRAY_BG,
              borderRadius: 24,
              padding: 18,
              gap: 16,
            }}>
              <Field
                label="Item Name"
                iconName="pricetag-outline"
                value={name}
                onChangeText={setName}
                placeholder="e.g., Black leather wallet"
              />
              <Field
                label="Description"
                iconName="document-text-outline"
                value={description}
                onChangeText={setDescription}
                placeholder="Colour, brand, distinguishing features…"
                multiline
              />
              <Field
                label={isLost ? "Where did you lose it?" : "Where did you find it?"}
                iconName="location-outline"
                value={location}
                onChangeText={setLocation}
                placeholder="e.g., Library, 2nd floor"
              />
            </View>

            {/* ── Photo Picker Card ── */}
            <View style={{
              backgroundColor: GRAY_BG,
              borderRadius: 24,
              padding: 18,
              gap: 12,
            }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="image-outline" size={15} color={BLUE_400} />
                <Text style={{ fontSize: 13, fontWeight: "700", color: DARK }}>Photo</Text>
                <Text style={{ fontSize: 12, color: GRAY_TXT }}> — helps people identify it</Text>
              </View>

              <TouchableOpacity onPress={pickImage} activeOpacity={0.85}>
                <View style={{
                  height: 180,
                  borderRadius: 18,
                  borderWidth: pickedImage ? 0 : 2,
                  borderColor: GRAY_MID,
                  borderStyle: "dashed",
                  backgroundColor: pickedImage ? "transparent" : WHITE,
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}>
                  {pickedImage ? (
                    <Image
                      source={{ uri: pickedImage }}
                      style={{ width: "100%", height: "100%", borderRadius: 18 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={{ alignItems: "center", gap: 10 }}>
                      <View style={{
                        width: 56, height: 56, borderRadius: 28,
                        backgroundColor: GRAY_BG,
                        alignItems: "center", justifyContent: "center",
                        borderWidth: 1.5, borderColor: GRAY_MID,
                      }}>
                        <Ionicons name="camera-outline" size={26} color={BLUE_400} />
                      </View>
                      <Text style={{ color: BLUE_400, fontWeight: "700", fontSize: 14 }}>
                        Tap to add a photo
                      </Text>
                      <Text style={{ color: GRAY_TXT, fontSize: 12 }}>
                        From your photo library
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              {pickedImage && (
                <TouchableOpacity
                  onPress={() => setPickedImage(null)}
                  style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 }}
                >
                  <Ionicons name="refresh-outline" size={13} color={GRAY_TXT} />
                  <Text style={{ color: GRAY_TXT, fontSize: 12 }}>Tap to replace photo</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* ── Progress bar ── */}
            <View style={{ gap: 6 }}>
              <View style={{ flexDirection: "row", gap: 6 }}>
                {[!!name, !!description, !!location, !!pickedImage].map((done, i) => (
                  <View key={i} style={{
                    flex: 1, height: 4, borderRadius: 2,
                    backgroundColor: done ? BLUE_400 : GRAY_MID,
                  }} />
                ))}
              </View>
              <Text style={{ fontSize: 12, color: GRAY_TXT, textAlign: "center" }}>
                {filledCount} of 4 fields complete
              </Text>
            </View>

            {/* ── Submit Button ── */}
            <TouchableOpacity
              onPress={handlePost}
              activeOpacity={0.85}
              disabled={uploading}
              style={{
                height: 56,
                borderRadius: 50,
                backgroundColor: posted ? "#22C55E" : allFilled ? BLUE_400 : "#BFDBFE",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 10,
                shadowColor: BLUE_500,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: allFilled ? 0.25 : 0,
                shadowRadius: 10,
                elevation: allFilled ? 4 : 0,
              }}
            >
              {uploading ? (
                <ActivityIndicator color={WHITE} />
              ) : posted ? (
                <>
                  <Ionicons name="checkmark-circle" size={20} color={WHITE} />
                  <Text style={{ color: WHITE, fontWeight: "700", fontSize: 16 }}>Posted!</Text>
                </>
              ) : (
                <>
                  <Ionicons name="send" size={17} color={WHITE} />
                  <Text style={{ color: WHITE, fontWeight: "700", fontSize: 16 }}>
                    Post {isLost ? "Lost" : "Found"} Item
                  </Text>
                </>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Post;