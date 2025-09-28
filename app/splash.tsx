import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { Image } from 'react-native'
import { useRouter } from "expo-router";

const splash = () => {
  const router=useRouter();
  useEffect(()=>{
   const timeout=setTimeout(()=>{
    router.replace("/AuthScreen")
   },1250)
  },[]);

  return (
    <View className='flex-1 items-center justify-center'>
       <Image source={require("./logo.png")} className="h-40" resizeMode="contain" />
    </View>
  )
}

export default splash