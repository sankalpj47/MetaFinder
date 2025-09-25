import { View, Text, ImageBackground,Image} from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'



const Tabicon= ({focused,title}: any ) => {
  if(focused){
  return (
    <View
      className='flex flex-row w-full flex-1 min-w-[110px] min-h-16  justify-center items-center rounded-full bg-blue-400 overflow-hidden'
    >
      <Text className='text-white  font-extrabold'>{title}</Text>
    </View>
  )
}
else{
  return (
    <View className='flex flex-row w-full flex-1 min-w-[97px] min-h-12 justify-center items-center overflow-hidden'>
      <Text className='text-black font-extrabold'>{title}</Text>
    </View>
  )
}
}


const _layout = () => {
  return (
    <Tabs screenOptions={{ tabBarShowLabel: false, 
      tabBarStyle : {
        backgroundColor: '#ffffff',
        borderColor: '#D1D5DB',
        marginHorizontal : 25,
        marginBottom : 44,
        height: 62,
        position: 'absolute',
        overflow: 'hidden',
        borderRadius: 30,
        borderWidth : 3,
        shadowColor: 'transparent',
        width: '88%',
        alignSelf: 'center',
              
    
      },

      tabBarItemStyle : {
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        top: 10,
      }
    }}>


      <Tabs.Screen
      name="index"
      options={{
          title: "Home",
        headerShown: false,
        tabBarIcon:({focused}) => (
          <Tabicon 
           focused={focused}
           title="Home"
          />
        )
      }} />

      <Tabs.Screen
      name="post"
      options={{
         title: "Post",
       headerShown: false,
       tabBarIcon:({focused}) => (
         <Tabicon 
          focused={focused}
          title="Post"
         />
       )
      }} />
  

      <Tabs.Screen
      name="profile"
      options={{
         title: "profile",
       headerShown: false,
       tabBarIcon:({focused}) => (
         <Tabicon 
         focused={focused}
         title="Profile"
         />
       )
      }} />


    
    </Tabs>
  )
}

export default _layout