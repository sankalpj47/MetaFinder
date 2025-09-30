import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { onSnapshot, doc, getDoc } from "firebase/firestore"
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, authi } from "../../firebase";
import { FlatList } from 'react-native'
import { Image } from 'react-native'
import { Link } from 'expo-router'
import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuProvider } from "react-native-popup-menu";
import { signOut } from 'firebase/auth'
import { updateProfile } from 'firebase/auth'
import { router } from 'expo-router'

   const logout=async()=>{
    try {
      await signOut(authi);
      router.replace("/AuthScreen")
    } catch (error) {
      console.error("Error signing out: ", error);
    } 
    }


const profile = () => {
  const user=authi.currentUser;
  const [selected,setSelected]=useState("lost")
  const [items,setItem]=useState<any[]>([]);
  const [phone,setPhone]=useState("")
useEffect(() => {
  if (!authi.currentUser) return;

  const q = query(
    collection(db, "items"),
    where("ownerUid", "==", authi.currentUser.uid)
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const itemsData: any[] = [];
    querySnapshot.forEach((doc) => {
      itemsData.push({ id: doc.id, ...doc.data() });
    });
    setItem(itemsData);
  });

  return () => unsubscribe(); 

}, []);
useEffect(() => {
  const fetchUser = async () => {
    if (!authi.currentUser) return;
    const docRef = doc(db, "users", authi.currentUser.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setPhone(docSnap.data().phone);
    }
  };
  fetchUser();
}, []);

const filteredData = items.filter(item => item.type === selected);

  var flag=0;
   if(filteredData.length===0){
   flag=1;
   }

  return (
    <MenuProvider>
    <View className='flex-1 bg-white '>
      <View className='flex-1 gap-4 items-center justify-center'>
    
      <View className='flex items-center w-full'>
     <View className='w-full h-44 bg-blue-400 gap-2  flex items-center'>      
      <View className='flex mt-16 flex-row gap-20'>
  
   <Menu>
  
  <MenuTrigger>
      <View className='bg-white h-10 w-10 rounded-full'>
        <Image source={require('../logout.jpg')} className="h-11 w-11 rounded-full" />
      </View>

    </MenuTrigger>

    <MenuOptions optionsContainerStyle={{height:52,width:88}}>
         <MenuOption onSelect={logout}>
      <Text style={{fontSize:20,padding:5}}>Logout</Text>
      </MenuOption>
    </MenuOptions>

  </Menu>

      <Text className='font-semibold text-3xl text-white'>{user?.displayName}</Text>
      <View className='bg-blue-400 h-10 w-10 flex justify-center items-center rounded-full'>
        
      </View>
      </View>
      <Text className='font-semibold text-xl text-gray-700 '>{phone}</Text>
   
     </View>
     </View>
    
     <View >
      <Text className='font-semibold text-2xl text-gray-800'>My Activity</Text>
     </View>

            <View className='h-16 w-96 bg-gray-300 rounded-4xl  flex flex-row items-center justify-evenly '>
          
            <TouchableOpacity onPress={() => setSelected("lost")}>
         {selected === "lost" ? (
           <View className="bg-blue-400 h-12 w-44 rounded-3xl flex items-center justify-center">
         <Text className="font-semibold text-white">Lost Items</Text>
          </View>
             ) : (
          <View className="bg-gray-300 h-12 w-44 rounded-3xl flex items-center justify-center">
           <Text className="font-semibold text-black">Lost Items</Text>
         </View>
         )}
          </TouchableOpacity>
   
            <TouchableOpacity onPress={() => setSelected("found")}>
         {selected === "found" ? (
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
                  {flag===1 && <Text className='mt-10 text-xl font-semibold text-gray-500'>No items found!!</Text>}
                 <FlatList
                 style={{ marginBottom: 120 }}
                 data={filteredData}
                  showsVerticalScrollIndicator={false}
                 renderItem={({ item }) => (
          
             <Link href={`/items/${item.id}`} asChild>
              <TouchableOpacity>
                   <View className='border border-gray-300 h-32 w-96 rounded-3xl flex flex-row'>
                    <View>
                     <Image source={{ uri: item.image }} className="h-24 w-24 rounded-2xl mt-4 ml-4 border border-gray-300" />
                      </View>
          
                      <View className='flex flex-col gap-2 -mt-1'>
                        <View className='flex flex-row items-center justify-between'>
                      <Text className='font-bold text-lg mt-4 ml-4'>{item.name}</Text>
                       <View className="bg-blue-400 h-6 mt-4 w-20 rounded-xl items-center justify-center ">
                   <Text className="font-bold text-white  text-sm">{item.type}</Text>
                         </View>
          
                      </View>
                      <View className='h-10 w-64'>
                      <Text className='font-semibold text-gray-600 ml-4'>{item.description}</Text>
                      </View>
                       <View className='flex flex-row gap-1 '>
                      <Text className='text-xs text-gray-600 ml-4'>Place: {item.location}</Text>
                       </View>
                      </View>
                   </View>
              </TouchableOpacity>
          </Link>
          
                 )}
                 keyExtractor={(item) => item.id}
                  ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
               />


     
     </View>
    </View>
    </MenuProvider>
  )
}

export default profile