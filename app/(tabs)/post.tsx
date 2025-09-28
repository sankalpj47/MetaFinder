import { View, Text, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import React, { useState } from 'react';
import { db, storage } from '../../firebase';
import { collection, addDoc } from "firebase/firestore";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { authi } from '../../firebase';

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dfdwq8ntm/image/upload";
const UPLOAD_PRESET = "THE_UNSIGNED_PRESET";

const Post = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [selected, setSelected] = useState("lost");
  const [pickedImage, setPickedImage] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access media library is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setPickedImage(result.assets[0].uri);
    }
  };

  const uploadImageToCloudinary = async (uri: string) => {
    const formData = new FormData();
    formData.append("file", {
      uri,
      type: "image/jpeg",
      name: "photo.jpg",
    } as any);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await axios.post(CLOUDINARY_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data.secure_url; 
  };
  
  const handlePost = async () => {
    if (!name || !description || !location || !pickedImage) {
      alert("Please fill all fields and select an image");
      return;
    }

    try {
  
      const downloadURL = await uploadImageToCloudinary(pickedImage);

      await addDoc(collection(db, "items"), {
        name,
        description,
        location,
        type: selected,
        image: downloadURL,
       ownerUid: authi.currentUser?.uid ??"",
        createdAt: new Date(),
      });

      alert("Item posted successfully!");

      setName("");
      setDescription("");
      setLocation("");
      setSelected("lost");
      setPickedImage(null);

    } catch (error) {
      console.error("Error posting item:", error);
      alert("Failed to post item");
    }
  };

  return (
    <View className="flex-1 bg-white h-screen">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 145, justifyContent: 'center', flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      >
        <View className="flex flex-row gap-6 mt-16 w-full justify-center">
          {["lost", "found"].map((type) => (
            <TouchableOpacity key={type} onPress={() => setSelected(type)}>
              <View className={`h-16 w-44 rounded-4xl items-center justify-center ${selected === type ? 'bg-blue-400' : 'bg-gray-300'}`}>
                <Text className={`font-semibold text-white ${selected !== type && 'text-black'}`}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      <View className="w-11/12 mx-auto flex-1 flex flex-col justify-evenly items-center gap-1 mt-5">

            <View className='flex items-start w-96'>
          <Text className="font-semibold text-lg ml-6">Item Name</Text>
            </View>   
          <TextInput value={name} onChangeText={setName} placeholder="Enter the item name" className="h-16 w-96 border-2 border-gray-300 p-4 rounded-4xl " />

           <View className='flex items-start w-96'>
          <Text className="font-semibold text-lg ml-6 mt-4">Description</Text>
           </View>
          <TextInput value={description} onChangeText={setDescription} placeholder="Enter the detailed description" className="h-24 w-96 border-2 border-gray-300 p-4 rounded-4xl " multiline />
       
          <View className='flex items-start w-96'>
          <Text className="font-semibold text-lg ml-6 mt-4">{selected === "found" ? "Location Found" : "Location Lost"}</Text>
          </View>
          <TextInput value={location} onChangeText={setLocation} placeholder="e.g., In the library" className="h-16 w-96 border-2 border-gray-300 p-4 rounded-4xl " />

          <View className='flex items-start w-96'>
          <Text className="font-semibold text-lg  ml-6 mt-4">Add Image</Text>
          </View>

          <TouchableOpacity onPress={pickImage}>
             <View className="flex h-44 w-96 border-2 border-gray-300 rounded-4xl  items-center justify-center">
              {pickedImage ? (<Image source={{ uri: pickedImage }} className="h-44 w-96 rounded-4xl" resizeMode="cover" />) : (<Image source={require("../imageIcon.png")} className="h-28 w-28" resizeMode="contain" />)}
           
            </View>
          </TouchableOpacity>
       
          <TouchableOpacity onPress={handlePost} className="mt-7 mb-96 w-full items-center">
            <View className="h-16 w-96 bg-blue-400 rounded-4xl items-center justify-center">
              <Text className="font-semibold text-white">Post {selected} item</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default Post;
