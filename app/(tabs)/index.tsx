import { View, Text, TextInput, Image, TouchableOpacity, FlatList, ActivityIndicator, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Link } from 'expo-router'
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore"
import { db, authi } from "../../firebase"
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  Search, Bell, User, X, MapPin,
  PackageSearch, PackageCheck, Inbox, Layers
} from 'lucide-react-native'
import { BLUE_400, BLUE_100, BLUE_200, BLUE_600, BLUE_700, BLUE_500, GRAY_BG, GRAY_MID, GRAY_TXT, DARK, WHITE, PLACEHOLDER, RED, RED_BG } from '../../constants/colours'
// activity.tsx uses '../constants/colors' (one level up, not two)

// Blue-only palette
// const BLUE_400  = "#60A5FA"   // main blue (header, active toggle)
// const BLUE_100  = "#DBEAFE"   // lightest blue (stat card bg, badge bg)
// const BLUE_200  = "#BFDBFE"   // light blue (stat icon bg, dot)
// const BLUE_600  = "#2563EB"   // darker blue (stat label text)
// const BLUE_700  = "#1D4ED8"   // deepest blue text
// const GRAY_BG   = "#F3F4F6"   // card backgrounds
// const GRAY_MID  = "#E4E4E4"   // toggle track
// const GRAY_TXT  = "#6B7280"
// const DARK      = "#1F2937"
// const WHITE     = "#FFFFFF"

export default function Index() {
  const [selected, setSelected]       = useState<"lost" | "found">("lost")
  const [items, setItems]             = useState<any[]>([])
  const [loading, setLoading]         = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [profilePic, setProfilePic]   = useState<string | null>(authi.currentUser?.photoURL || null)
  const [userName, setUserName]       = useState(authi.currentUser?.displayName || "")

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "items"), (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, (err) => { console.error(err); setLoading(false) })
    return () => unsub()
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      if (!authi.currentUser) return
      const snap = await getDoc(doc(db, "users", authi.currentUser.uid))
      if (snap.exists()) {
        const data = snap.data()
        if (data.photoURL) setProfilePic(data.photoURL)
      }
      // Also refresh displayName in case it updated
      setUserName(authi.currentUser.displayName || "")
    }
    fetchUser()
  }, [])

  const filteredData = items.filter(item => {
    const matchType = item.type === selected
    const q = searchQuery.trim().toLowerCase()
    if (!q) return matchType
    return matchType && (
      item.name?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.location?.toLowerCase().includes(q)
    )
  })

  const recentlyAdded = [...items]
    .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
    .slice(0, 6)

  const lostCount  = items.filter(i => i.type === "lost").length
  const foundCount = items.filter(i => i.type === "found").length
  const isEmpty    = filteredData.length === 0 && !loading

  return (
    // FIX: SafeAreaView bg = BLUE_400 so the status bar area blends into the header — no white gap
    <SafeAreaView style={{ flex: 1, backgroundColor: BLUE_400 }} edges={['top']}>
      <View style={{ flex: 1, backgroundColor: WHITE }}>
        <FlatList
          data={filteredData}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}

          ListHeaderComponent={
            <View style={{ backgroundColor: WHITE }}>

              {/* ── Blue Header ── */}
              <View style={{
                backgroundColor: BLUE_400,
                borderBottomLeftRadius: 36,
                borderBottomRightRadius: 36,
                paddingTop: Platform.OS === 'android' ? 16 : 8,
                paddingBottom: 24,
                paddingHorizontal: 20,
                marginBottom: 16,
              }}>
                {/* Top row */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <Link href="/profile" asChild>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }} activeOpacity={0.8}>
                      <View style={{
                        height: 44, width: 44, borderRadius: 22,
                        backgroundColor: BLUE_200, alignItems: 'center', justifyContent: 'center',
                        borderWidth: 2, borderColor: WHITE, overflow: 'hidden',
                      }}>
                        {profilePic
                          ? <Image source={{ uri: profilePic }} style={{ height: 44, width: 44 }} resizeMode="cover" />
                          : <User size={20} color={BLUE_600} />
                        }
                      </View>
                      <View>
                        <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>Hi there,</Text>
                        <Text style={{ color: WHITE, fontSize: 18, fontWeight: '700' }} numberOfLines={1}>
                          {userName || "there"}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </Link>

                  <TouchableOpacity style={{
                    height: 44, width: 44, borderRadius: 22,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Bell size={20} color={WHITE} />
                  </TouchableOpacity>
                </View>

                {/* Search bar */}
                <View style={{
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: WHITE, borderRadius: 50,
                  paddingHorizontal: 16, height: 52, gap: 10,
                }}>
                  <Search size={17} color="#9CA3AF" />
                  <TextInput
                    placeholder='Search items...'
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#9CA3AF"
                    style={{ flex: 1, fontSize: 14, color: DARK }}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                      <X size={17} color="#9CA3AF" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* ── Stats strip — all blue shades ── */}
              <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 16 }}>
                {/* Lost */}
                <View style={{ flex: 1, backgroundColor: BLUE_100, borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: BLUE_200, alignItems: 'center', justifyContent: 'center' }}>
                    <PackageSearch size={17} color={BLUE_600} />
                  </View>
                  <View>
                    <Text style={{ fontSize: 20, fontWeight: '800', color: BLUE_600 }}>{lostCount}</Text>
                    <Text style={{ fontSize: 10, color: BLUE_700, fontWeight: '600' }}>Lost</Text>
                  </View>
                </View>

                {/* Found */}
                <View style={{ flex: 1, backgroundColor: BLUE_100, borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: BLUE_200, alignItems: 'center', justifyContent: 'center' }}>
                    <PackageCheck size={17} color={BLUE_600} />
                  </View>
                  <View>
                    <Text style={{ fontSize: 20, fontWeight: '800', color: BLUE_600 }}>{foundCount}</Text>
                    <Text style={{ fontSize: 10, color: BLUE_700, fontWeight: '600' }}>Found</Text>
                  </View>
                </View>

                {/* Total */}
                <View style={{ flex: 1, backgroundColor: BLUE_100, borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: BLUE_200, alignItems: 'center', justifyContent: 'center' }}>
                    <Layers size={17} color={BLUE_600} />
                  </View>
                  <View>
                    <Text style={{ fontSize: 20, fontWeight: '800', color: BLUE_600 }}>{items.length}</Text>
                    <Text style={{ fontSize: 10, color: BLUE_700, fontWeight: '600' }}>Total</Text>
                  </View>
                </View>
              </View>

              {/* ── Recently Added ── */}
              {recentlyAdded.length > 0 && (
                <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
                  <View style={{ backgroundColor: GRAY_BG, borderRadius: 24, padding: 16 }}>
                    <Text style={{ fontWeight: '700', fontSize: 16, color: DARK, marginBottom: 14 }}>
                      Recently Added
                    </Text>
                    <FlatList
                      data={recentlyAdded}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      keyExtractor={item => 'r-' + item.id}
                      ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
                      renderItem={({ item }) => (
                        <Link href={`/items/${item.id}`} asChild>
                          <TouchableOpacity style={{ alignItems: 'center', width: 72 }} activeOpacity={0.8}>
                            <View>
                              <Image
                                source={{ uri: item.image }}
                                style={{ height: 64, width: 64, borderRadius: 16, backgroundColor: WHITE }}
                                resizeMode="cover"
                              />
                              {/* blue dot instead of yellow/green */}
                              <View style={{
                                position: 'absolute', top: -2, right: -2,
                                width: 14, height: 14, borderRadius: 7,
                                backgroundColor: BLUE_400,
                                borderWidth: 2, borderColor: GRAY_BG,
                              }} />
                            </View>
                            <Text numberOfLines={1} style={{ fontSize: 11, fontWeight: '600', color: DARK, marginTop: 6, textAlign: 'center' }}>
                              {item.name}
                            </Text>
                          </TouchableOpacity>
                        </Link>
                      )}
                    />
                  </View>
                </View>
              )}

              {/* ── Lost / Found Toggle ── */}
              <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
                <View style={{
                  height: 56, backgroundColor: GRAY_MID,
                  borderRadius: 50, flexDirection: 'row',
                  alignItems: 'center', padding: 4,
                }}>
                  {(['lost', 'found'] as const).map(tab => (
                    <TouchableOpacity
                      key={tab}
                      onPress={() => { setSelected(tab); setSearchQuery("") }}
                      activeOpacity={0.8}
                      style={{
                        flex: 1, flexDirection: 'row', alignItems: 'center',
                        justifyContent: 'center', gap: 6, height: 48,
                        borderRadius: 50,
                        backgroundColor: selected === tab ? BLUE_400 : 'transparent',
                      }}
                    >
                      {tab === 'lost'
                        ? <PackageSearch size={15} color={selected === tab ? WHITE : GRAY_TXT} />
                        : <PackageCheck  size={15} color={selected === tab ? WHITE : GRAY_TXT} />
                      }
                      <Text style={{
                        fontWeight: '700', fontSize: 14,
                        color: selected === tab ? WHITE : DARK,
                      }}>
                        {tab === 'lost' ? 'Lost Items' : 'Found Items'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Result count */}
              {!isEmpty && (
                <Text style={{ fontSize: 13, color: GRAY_TXT, fontWeight: '500', paddingHorizontal: 20, marginBottom: 8 }}>
                  {filteredData.length} item{filteredData.length !== 1 ? 's' : ''}
                  {searchQuery ? ` for "${searchQuery}"` : ''}
                </Text>
              )}

              {/* Empty state */}
              {isEmpty && (
                <View style={{ alignItems: 'center', paddingVertical: 40, gap: 10 }}>
                  <Inbox size={52} color={BLUE_200} strokeWidth={1.5} />
                  <Text style={{ fontSize: 16, fontWeight: '700', color: GRAY_TXT }}>
                    No {selected} items yet
                  </Text>
                  <Text style={{ fontSize: 13, color: '#9CA3AF' }}>
                    {searchQuery ? 'Try a different keyword' : 'Check back later'}
                  </Text>
                </View>
              )}
            </View>
          }

          renderItem={({ item }) => (
            <Link href={`/items/${item.id}`} asChild>
              <TouchableOpacity activeOpacity={0.85} style={{ paddingHorizontal: 20, marginBottom: 12 }}>
                <View style={{
                  backgroundColor: GRAY_BG,
                  borderRadius: 24,
                  flexDirection: 'row',
                  overflow: 'hidden',
                }}>
                  <Image
                    source={{ uri: item.image }}
                    style={{ width: 100, height: 110, borderTopLeftRadius: 24, borderBottomLeftRadius: 24 }}
                    resizeMode="cover"
                  />

                  <View style={{ flex: 1, padding: 14, justifyContent: 'space-between' }}>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: DARK, flex: 1, marginRight: 8 }} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <View style={{
                        backgroundColor: BLUE_100,
                        borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
                      }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: BLUE_600 }}>
                          {item.type.toUpperCase()}
                        </Text>
                      </View>
                    </View>


                    <Text style={{ fontSize: 12, color: GRAY_TXT, lineHeight: 17, marginTop: 4 }} numberOfLines={2}>
                      {item.description}
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                      <MapPin size={12} color="#9CA3AF" />
                      <Text style={{ fontSize: 12, color: '#9CA3AF', fontWeight: '500' }} numberOfLines={1}>
                        {item.location}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </Link>
          )}

          ListFooterComponent={loading
            ? <ActivityIndicator size="large" color={BLUE_400} style={{ marginTop: 24 }} />
            : null
          }
        />
      </View>
    </SafeAreaView>
  )
}