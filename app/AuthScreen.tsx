import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { login, signup } from "../firebase";
import { useRouter } from "expo-router";

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const switchMode = (toLogin: boolean) => {
    setIsLogin(toLogin);
    setEmail("");
    setPassword("");
    setPhone("");
    setName("");
  };

  const handleAuth = async () => {
   
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please enter your email and password.");
      return;
    }
    if (!isLogin && (!name.trim() || !phone.trim())) {
      Alert.alert("Missing fields", "Please fill in all fields to sign up.");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email.trim(), password);
      } else {
  
        await signup(email.trim(), password, name.trim(), phone.trim());
      }
      router.replace("/(tabs)");
    } catch (error: any) {
      const msg =
        error?.code === "auth/user-not-found" || error?.code === "auth/wrong-password"
          ? "Incorrect email or password."
          : error?.code === "auth/email-already-in-use"
          ? "An account with this email already exists."
          : error?.code === "auth/weak-password"
          ? "Password should be at least 6 characters."
          : error?.code === "auth/invalid-email"
          ? "Please enter a valid email address."
          : "Something went wrong. Please try again.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f8f9ff" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 40, justifyContent: "center" }}>
          <View style={{ alignItems: "center", marginBottom: 36 }}>
            <Image
              source={require("./logo.png")}
              style={{ height: 80, width: 160, marginBottom: 20 }}
              resizeMode="contain"
            />
            <Text style={{ fontSize: 26, fontWeight: "700", color: "#1a1a2e", letterSpacing: -0.5 }}>
              {isLogin ? "Welcome back" : "Create account"}
            </Text>
            <Text style={{ fontSize: 14, color: "#6b7280", marginTop: 6 }}>
              {isLogin ? "Sign in to continue" : "Fill in your details to get started"}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 20,
              padding: 24,
              shadowColor: "#3b5bdb",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 16,
              elevation: 4,
              gap: 14,
            }}
          >
            {!isLogin && (
              <>
                <InputField
                  label="Full Name"
                  placeholder="John Doe"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words" 
                  autoCorrect={false}
                />
                <InputField
                  label="Phone Number"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"  
                  autoCapitalize="none"
                />
              </>
            )}

            <InputField
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <InputField
              label="Password"
              placeholder={isLogin ? "Your password" : "Min. 6 characters"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

           
            <TouchableOpacity
              onPress={handleAuth}
              disabled={loading}
              activeOpacity={0.85}
              style={{
                backgroundColor: loading ? "#93c5fd" : "#3b82f6",
                borderRadius: 14,
                height: 52,
                alignItems: "center",
                justifyContent: "center",
                marginTop: 6,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                  {isLogin ? "Sign In" : "Create Account"}
                </Text>
              )}
            </TouchableOpacity>
          </View>

       
          <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 24, gap: 4 }}>
            <Text style={{ color: "#6b7280", fontSize: 14 }}>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </Text>
            <TouchableOpacity onPress={() => switchMode(!isLogin)}>
              <Text style={{ color: "#3b82f6", fontSize: 14, fontWeight: "600" }}>
                {isLogin ? " Sign up" : " Sign in"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};


const InputField = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  autoCorrect = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  autoCorrect?: boolean;
}) => (
  <View style={{ gap: 6 }}>
    <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginLeft: 2 }}>
      {label}
    </Text>
    <TextInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor="#9ca3af"   
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
      style={{
        borderWidth: 1.5,
        borderColor: "#e5e7eb",
        backgroundColor: "#f9fafb",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 13,
        fontSize: 15,
        color: "#1f2937",
      }}
    />
  </View>
);

export default AuthScreen;