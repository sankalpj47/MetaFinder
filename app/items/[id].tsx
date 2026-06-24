import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking, Platform } from 'react-native'
import React, { useState, useEffect } from 'react'
import { db } from "../../firebase"
import { useRouter, useLocalSearchParams } from 'expo-router'
import { onSnapshot, doc, getDoc, deleteDoc } from "firebase/firestore"
import { authi } from '../../firebase'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const BLUE_400 = "#60A5FA"
const BLUE_100 = "#DBEAFE"
const BLUE_600 = "#2563EB"
const GRAY_BG  = "#F3F4F6"
const GRAY_TXT = "#6B7280"
const DARK     = "#1F2937"
const WHITE    = "#FFFFFF"
const RED      = "#EF4444"
const RED_BG   = "#FEF2F2"

const ItemDetails = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams()
  const [item, setItem]     = useState<any>(null)
  const [name, setName]     = useState("")
  const [phone, setPhone]   = useState("")
  const [loading, setLoading] = useState(true)

  const handleDelete = () => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", style: "destructive",
          onPress: async () => {
            if (!id) return
            try {
              await deleteDoc(doc(db, "items", id as string))
              router.push("/(tabs)")
            } catch (e) { console.error(e) }
          },
        },
      ]
    )
  }

  const handleCall = () => { if (phone) Linking.openURL(`tel:${phone}`) }

  useEffect(() => {
    if (!id) return
    const unsub = onSnapshot(doc(db, "items", id as string), (snap) => {
      if (snap.exists()) {
        const data: any = { id: snap.id, ...snap.data() }
        setItem(data)
        setLoading(false)
        if (data.ownerUid) fetchUser(data.ownerUid)
      } else {
        setItem(null); setLoading(false)
      }
    }, (e) => { console.error(e); setLoading(false) })
    return () => unsub()
  }, [id])

  const fetchUser = async (uid: string) => {
    try {
      const snap = await getDoc(doc(db, "users", uid))
      if (snap.exists()) {
        const d = snap.data()
        setName(d.name || "")
        setPhone(d.phone || "")
      }
    } catch (e) { console.log(e) }
  }

  const isOwner = authi.currentUser?.displayName === name
  const isLost  = item?.type === "lost"

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: WHITE, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={BLUE_400} />
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: WHITE }}>

      {/* ── Full-bleed image (reference style) ── */}
      <View style={{ width: '100%', height: 420 }}>
        <Image
          source={{ uri: item?.image }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />

        {/* Gradient overlay at bottom of image for readability */}
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
          // background: 'transparent',
        }} />

        {/* Back button — floating on image */}
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.8}
          style={{
            position: 'absolute',
            top: insets.top + 12,
            left: 20,
            height: 42, width: 42, borderRadius: 21,
            backgroundColor: 'rgba(0,0,0,0.35)',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Ionicons name="chevron-back" size={22} color={WHITE} />
        </TouchableOpacity>

        {/* Type badge — floating top right */}
        <View style={{
          position: 'absolute',
          top: insets.top + 12,
          right: 20,
          backgroundColor: BLUE_400 ,
          paddingHorizontal: 14, paddingVertical: 6,
          borderRadius: 50,
        }}>
          <Text style={{ color: WHITE, fontWeight: '700', fontSize: 12, textTransform: 'capitalize' }}>
            {item?.type}
          </Text>
        </View>
      </View>

      {/* ── Content card — slides up over the image (reference style) ── */}
      <View style={{
        flex: 1,
        backgroundColor: WHITE,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        marginTop: -32,           // pulls card up over image
        paddingHorizontal: 24,
        paddingTop: 28,
        paddingBottom: 40,
        // shadow on iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 10,
      }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

          {/* Name + location row */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ fontSize: 26, fontWeight: '800', color: DARK, flex: 1, marginRight: 12 }}>
              {item?.name}
            </Text>
          </View>

          {/* Location */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 }}>
            <Ionicons name="location-outline" size={14} color={GRAY_TXT} />
            <Text style={{ fontSize: 13, color: GRAY_TXT }}>
              {isLost ? "Lost at" : "Found at"} {item?.location}
            </Text>
          </View>

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: GRAY_BG, marginBottom: 16 }} />

          {/* Description */}
          <Text style={{ fontSize: 15, color: GRAY_TXT, lineHeight: 24, marginBottom: 28 }}>
            {item?.description}
          </Text>

          {/* ── Bottom row: owner name + call button (reference: "Buy Now" + cart icon) ── */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>

            {/* Owner pill — takes the place of "Buy Now" */}
           <View
  style={{
    flex: 1,
    backgroundColor: BLUE_400,
    borderRadius: 50,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 14,
  }}
>
  <View
    style={{
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(255,255,255,0.25)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    }}
  >
    <Ionicons name="person" size={16} color={WHITE} />
  </View>

  <View style={{ flex: 1 }}>
    <Text
      style={{
        color: WHITE,
        fontWeight: '700',
        fontSize: 15,
      }}
      numberOfLines={1}
    >
      {name || 'Unknown'}
    </Text>

    {!!phone && (
      <Text
        style={{
          color: 'rgba(255,255,255,0.8)',
          fontSize: 12,
        }}
        numberOfLines={1}
      >
        {phone}
      </Text>
    )}
  </View>
</View>

            {/* Call button — takes the place of cart icon */}
            {!!phone && (
              <TouchableOpacity
                onPress={handleCall}
                activeOpacity={0.8}
                style={{
                  height: 56, width: 56, borderRadius: 28,
                  backgroundColor: GRAY_BG,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Ionicons name="call" size={22} color={BLUE_600} />
              </TouchableOpacity>
            )}
          </View>

          {/* Delete button — only for owner */}
          {isOwner && (
            <TouchableOpacity
              onPress={handleDelete}
              activeOpacity={0.85}
              style={{ marginTop: 16 }}
            >
              <View style={{
                height: 52, borderRadius: 50,
                backgroundColor: RED_BG,
                borderWidth: 1, borderColor: '#FECACA',
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <Ionicons name="trash-outline" size={18} color={RED} />
                <Text style={{ color: RED, fontWeight: '600', fontSize: 15 }}>Delete Post</Text>
              </View>
            </TouchableOpacity>
          )}

        </ScrollView>
      </View>
    </View>
  )
}

export default ItemDetails