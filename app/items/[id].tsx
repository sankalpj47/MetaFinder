import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { db } from "../../firebase"
import { useRouter, useLocalSearchParams } from 'expo-router'
import { onSnapshot, doc, getDoc } from "firebase/firestore"
import { authi } from '../../firebase'
import { deleteDoc } from "firebase/firestore"

const ItemDetails = () => {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const [item, setItem] = useState<any>(null)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")


const handleDelete=async()=>{
  if (!id) return
  try {
    await deleteDoc(doc(db, "items", id as string))
    // router.back()
    router.push("/(tabs)")
  } catch (error) {
    console.error("Error deleting item: ", error)
  }
}

useEffect(() => {
  if (!id) return
  const unsubscribe = onSnapshot(
    doc(db, "items", id as string),
    (docSnap) => {
      if (docSnap.exists()) {
        const itemData: any = { id: docSnap.id, ...docSnap.data() }
        setItem(itemData)

        if (itemData.ownerUid) {
          fetchUser(itemData.ownerUid)
        } else {
          console.warn("Item has no ownerUid field")
        }
      } else {
        setItem(null)
      }
    },
    (error) => console.error("Error fetching item: ", error)
  )

  return () => unsubscribe()
}, [id])


  const fetchUser = async (uid: string) => {
    try {
      const userRef = doc(db, "users", uid)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        const userData = userSnap.data()
        setName(userData.name || "")
        setPhone(userData.phone || "")
      } else {
        console.log("No such user document")
      }
    } catch (error) {
      console.log("Error fetching user data:", error)
    }
  }
  const current=authi.currentUser?.displayName;
  var flag=false;
  if(current==name){
    flag=true;
  }
  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 60, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 bg-white gap-6 items-center">
          
      
          <View className="h-96 w-96  border-gray-300 mt-16 rounded-3xl">
            <Image source={{ uri: item?.image }} className="h-full w-96 rounded-3xl" resizeMode="cover" />
          </View>

          <View className="items-start gap-2 w-96 bg-blue-400 rounded-3xl p-6">
            <View className='flex flex-row gap-2'>
              <Text className="text-xl text-gray-700">Item Name:</Text>
              <Text className="text-xl text-white font-semibold">{item?.name}</Text>
            </View>
            <View className='flex flex-row gap-2'>
              <Text className="text-xl text-gray-700">Description:</Text>
              <Text className="text-xl w-56 text-white font-semibold">{item?.description}</Text>
            </View>
            <View className='flex flex-row gap-2'>
              <Text className="text-xl text-gray-700">Location {item?.type === "lost" ? "Lost" : "Found"}:</Text>
              <Text className="text-xl text-white font-semibold">{item?.location}</Text>
            </View>
          </View>

          <View className="items-start gap-2 w-96 border border-gray-300 rounded-3xl p-5">
            <View className="flex flex-row gap-2">
              {item?.type === "lost"
                ? <Text className="text-xl text-gray-800">Owner's Name:</Text>
                : <Text className="text-xl text-gray-800">Finder's Name:</Text>}
              <Text className="text-xl text-gray-800 font-semibold">{name}</Text>
            </View>

            <View className="flex flex-row gap-2">
              <Text className="text-xl text-gray-800">Contact Number:</Text>
              <Text className="text-xl text-gray-800 font-semibold">{phone}</Text>
            </View>

          </View>
          <TouchableOpacity onPress={handleDelete}>
          {flag?( <View className='flex items-center justify-center'>
            <Text className="bg-blue-400 h-16 w-96 font-semibold rounded-3xl text-white text-lg text-center align-middle flex items-center justify-center">
              Delete Post
            </Text>
            </View>
            ):(null)}
           </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

export default ItemDetails
