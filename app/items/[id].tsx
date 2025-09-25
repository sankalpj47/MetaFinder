import { View, Text } from 'react-native'
import React from 'react'
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase"; 
import { useEffect } from 'react';




const ItemDetails = () => {
  return (
    <View className='flex-1 bg-white items-center '>
     <View className='h-1/2 w-96 border border-gray-300 mt-16 rounded-3xl' >
       {/* <Image source={{ uri: pickedImage }} className="h-44 w-96 rounded-4xl" resizeMode="cover" /> */}
     </View>
    </View>
  )
}

export default ItemDetails