import { View, Text, Alert, TouchableOpacity, TextInput } from "react-native";
import React, { useState } from "react";
import { login, signup } from "../firebase";
import { useRouter } from "expo-router";
import { Image } from "react-native";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone,setPhone]=useState("");
  const [name,setName]=useState("");
  const router = useRouter();
  

  const handleAuth = async () => {
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password ,name,phone);
      }
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Error","Enter valid details!");
    }
  };

  return (
        <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 20 }}
        keyboardShouldPersistTaps="handled"
      >

    <View className="flex-1 items-center justify-center gap-6">

       <Image source={require("./logo.png")} className="h-40 w-52" resizeMode="contain" />
      
        <View className="w-full items-center gap-7">


      <Text className="text-2xl text-gray-600 font-bold">{isLogin ? "Login to your account" : "Create an account"}</Text>
  {isLogin ? (
         <View className="w-full items-center gap-6">
      <TextInput
        placeholder="Enter email"
        value={email}
        onChangeText={setEmail}
        className="border border-gray-400 p-4 w-96 h-14 rounded-xl"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Enter password"
        value={password}
        onChangeText={setPassword}
        className="border border-gray-400 p-4 w-96 h-14 rounded-xl"
        secureTextEntry
      />
      </View>
  ) : (
      <View className="w-full items-center gap-6">
      <TextInput
        placeholder="Enter Name"
        value={name}
        onChangeText={setName}
        className="border border-gray-400 p-4 w-96 h-14 rounded-xl"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Enter Phone Number"
        value={phone}
        onChangeText={setPhone}
        className="border border-gray-400 p-4 w-96 h-14 rounded-xl"
        secureTextEntry
      />
      <TextInput
        placeholder="Enter Email"
        value={email}
        onChangeText={setEmail}
        className="border border-gray-400 p-4 w-96 h-14 rounded-xl"
        secureTextEntry
      />
      <TextInput
        placeholder="Enter password"
        value={password}
        onChangeText={setPassword}
        className="border border-gray-400 p-4 w-96 h-14 rounded-xl"
        secureTextEntry
      />
      </View>
  )}
      
      <TouchableOpacity onPress={handleAuth}>
        <View className="bg-blue-500 flex items-center justify-center px-6 w-96 h-14 py-2 rounded-xl">
          <Text className="text-white text-base">{isLogin ? "Log in" : "Sign up"}</Text>
        </View>
      </TouchableOpacity>
      <View>
        {isLogin ? (
          <Text className="text-xl text-gray-600">Don't have an account? <Text onPress={() => setIsLogin(false)} className="text-blue-500 text-xl">Sign up</Text></Text>
        ) : (
          <Text className="text-xl text-gray-600">Already have an account? <Text onPress={() => setIsLogin(true)} className="text-blue-500 text-xl">Login</Text></Text>
        )}
      </View>
      </View>
    </View>
          </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AuthScreen;
