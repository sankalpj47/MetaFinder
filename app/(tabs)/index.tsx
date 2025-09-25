import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { TextInput, Image } from 'react-native'
import { TouchableOpacity } from 'react-native'
import { FlatList } from 'react-native'
import { Link } from 'expo-router'
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase"; 
import { onSnapshot } from 'firebase/firestore'


export default function index() {
const [selected, setSelected] = useState("lost");
  const [items, setItems] = useState<any[]>([]);  
  const [loading, setLoading] = useState(true);
 
useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, "items"), (snapshot) => {
    const itemsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setItems(itemsData);
    setLoading(false);
  }, (error) => {
    console.error("Error fetching items: ", error);
    setLoading(false);
  });

  return () => unsubscribe();
}, []);



const filteredData = items.filter(item => item.type === selected);


  return (
        <>
          <View className='flex-1 bg-white'>
     <View className='flex-1 items-center gap-5 bg-white'>

      <View className='flex flex-row mt-16 gap-5'>
       <TextInput 
       placeholder='   search item..'
       className='h-16 w-72 border border-gray-300 p-4 rounded-full'>
       </TextInput>
       
      <View className='h-16 w-16 bg-blue-400 rounded-full'>
      </View> 
        </View>

        <View className='h-40 w-96 bg-blue-400 rounded-3xl flex flex-row items-center gap-2 '>
         <Image source={require("../lost.png")} className="h-36 w-48" resizeMode="contain" />

          <Text className='font-semibold text-xl text-center text-black'>
            Find what's{"\n"}missing,{"\n"}return{"\n"}what's found!
          </Text>
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

            <View className='flex flex-col gap-2'>
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
    </>
  )
}