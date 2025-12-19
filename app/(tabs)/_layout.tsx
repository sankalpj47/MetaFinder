import { View, Text, ImageBackground,Image, TouchableOpacity} from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import { router } from "expo-router";

const icons: Record<string, number> ={
  Home: require('../home.png'),
  Profile: require('../user.png')
}


export function PlusIcon() {
  return (
       <TouchableOpacity
      onPress={() => router.push("/post")} // ✅ navigation
      activeOpacity={0.8}
      style={{
        bottom: 16,
        justifyContent: "center",
        alignItems: "center",
        elevation: 8,
        zIndex: 100,
      }}
    >
      <Image
        source={require("../plus.png")}
        style={{ height: 60, width: 60 }}
      />
    </TouchableOpacity>
  );
}

const Tabicon= ({focused,title}: any ) => {
  if(focused){
  return (
    <View
      className='flex flex-col w-full flex-1 min-w-[110px] min-h-12  justify-center items-center overflow-hidden'
    >
      <Image
    source={icons[title]}
    style={{height:20,
    width:20,
   tintColor: '#669EFF'
   }}

    />
      <Text className='text-blue-400 text-sm  font-extrabold'>{title}</Text>
    </View>
  
  )
}
else{
  return (
    <View className='flex flex-col w-full flex-1 min-w-[110px] min-h-12 justify-center items-center overflow-hidden'>
            <Image
       source={icons[title]}
    style={{height:20,
      width:20,  
    tintColor: '#000000'
   }}

/>
      <Text className='text-black text-sm font-extrabold'>{title}</Text>

    </View>
  )
}

}


const _layout = () => {
  return (
    <Tabs screenOptions={{ tabBarShowLabel: false, 
      tabBarStyle : {
        // backgroundColor: '#E4E4E4',
        borderColor: '#E4E4E4',
        // marginHorizontal : 25,
        height: 110,
        overflow: 'visible',
        borderRadius: 30,
        borderTopWidth:3,
        borderTopLeftRadius:30,
        borderTopRightRadius:30,
        borderWidth : 3,
        shadowColor: '#E4E4E4',
        position: 'absolute',
        width: '100%',
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
       tabBarIcon:() => (
         <PlusIcon /> 
       )
      }} />
  

      <Tabs.Screen
      name="profile"
      options={{
         title: "Profile",
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