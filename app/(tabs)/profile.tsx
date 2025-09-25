import { View, Text } from 'react-native'
import React from 'react'
import { useState } from 'react'
import { TouchableOpacity } from 'react-native'


const profile = () => {
 

  const [selected,setSelected]=useState("Lost")

  return (
    <View className='flex-1 bg-white '>
      <View className='flex-1 gap-7 items-center'>
    

      <View className='flex items-center w-full'>
     <View className='w-full h-60 bg-blue-400 rounded-2xl flex items-center'>
      <Text className='font-semibold text-3xl mt-20'>Name</Text>
     </View>
     <View className='bg-gray-300 h-56 w-56 -mt-20 rounded-full border-6 border-white'></View>
  
     </View>
    
     <View >
      <Text className='font-semibold text-2xl text-gray-600'>My Activity</Text>
     </View>

            <View className='h-16 w-96 bg-gray-300 rounded-4xl  flex flex-row items-center justify-evenly '>
     
            <TouchableOpacity onPress={() => setSelected("Lost")}>
         {selected === "Lost" ? (
           <View className="bg-blue-400 h-12 w-44 rounded-3xl flex items-center justify-center">
         <Text className="font-semibold text-white">Lost Items</Text>
          </View>
             ) : (
          <View className="bg-gray-300 h-12 w-44 rounded-3xl flex items-center justify-center">
           <Text className="font-semibold text-black">Lost Items</Text>
         </View>
         )}
          </TouchableOpacity>
   
            <TouchableOpacity onPress={() => setSelected("Found")}>
         {selected === "Found" ? (
          <View className='bg-blue-400 h-12 w-44 rounded-3xl flex items-center justify-center'>
             <Text className="font-semibold text-white">Found Items</Text>
            </View>
             ) : (
          <View className="bg-gray-300 h-12 w-44 rounded-3xl flex items-center justify-center">
           <Text className="font-semibold text-black">Found Items</Text>
         </View>
         )}
          </TouchableOpacity>
            </View>

      {/* <View className='bg-blue-500 h-80 w-full'></View> */}

     
     </View>
    </View>
  )
}

export default profile