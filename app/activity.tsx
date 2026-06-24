import { View, Text, Image, TouchableOpacity, FlatList, ActivityIndicator, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Link, router, Stack } from 'expo-router'
import { collection, onSnapshot, query, where } from "firebase/firestore"
import { db, authi } from "../firebase"
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeft, PackageSearch, PackageCheck, MapPin, Inbox, Layers } from 'lucide-react-native'

// ── Shared palette (identical to index + post + profile) ──
const BLUE_400 = "#60A5FA"
const BLUE_100 = "#DBEAFE"
const BLUE_200 = "#BFDBFE"
const BLUE_600 = "#2563EB"
const BLUE_700 = "#1D4ED8"
const GRAY_BG  = "#F3F4F6"
const GRAY_MID = "#E4E4E4"
const GRAY_TXT = "#6B7280"
const DARK     = "#1F2937"
const WHITE    = "#FFFFFF"

export default function ActivityPage() {
  const [selected, setSelected] = useState<"lost" | "found">("lost")
  const [items, setItems]       = useState<any[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!authi.currentUser) return
    const q = query(collection(db, "items"), where("ownerUid", "==", authi.currentUser.uid))
    return onSnapshot(q, (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, (err) => { console.error(err); setLoading(false) })
  }, [])

  const lostCount  = items.filter(i => i.type === "lost").length
  const foundCount = items.filter(i => i.type === "found").length
  const filtered   = items.filter(i => i.type === selected)
  const isEmpty    = filtered.length === 0 && !loading

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: BLUE_400 }} edges={['top']}>
      <View style={{ flex: 1, backgroundColor: WHITE }}>
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}

          ListHeaderComponent={
            <View style={{ backgroundColor: WHITE }}>

              {/* ── Blue Header — same shape as index/post/profile ── */}
              <View style={{
                backgroundColor: BLUE_400,
                borderBottomLeftRadius: 36,
                borderBottomRightRadius: 36,
                paddingTop: Platform.OS === 'android' ? 16 : 8,
                paddingBottom: 48,        // extra room so stats lift over the curve
                paddingHorizontal: 20,
                marginBottom: 16,
              }}>
                {/* Back row — same top row pattern as profile header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 0 }}>
                  <TouchableOpacity
                    onPress={() => router.back()}
                    style={{ height: 44, width: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <ArrowLeft size={18} color={WHITE} />
                  </TouchableOpacity>
                  <View>
                    <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>Your posts</Text>
                    <Text style={{ color: WHITE, fontSize: 18, fontWeight: '700' }}>My Activity</Text>
                  </View>
                </View>
              </View>

              {/* ── Stats strip — lifted over curve, EXACTLY matching index page stats ── */}
              <View style={{ flexDirection: 'row', gap: 10, marginHorizontal: 20, marginTop: -32, marginBottom: 20 }}>
                {[
                  { icon: <PackageSearch size={17} color={BLUE_600} />, count: lostCount,             label: 'Lost' },
                  { icon: <PackageCheck  size={17} color={BLUE_600} />, count: foundCount,            label: 'Found' },
                  { icon: <Layers        size={17} color={BLUE_600} />, count: lostCount + foundCount, label: 'Total' },
                ].map((s, i) => (
                  <View key={i} style={{ flex: 1, backgroundColor: BLUE_100, borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: BLUE_200, alignItems: 'center', justifyContent: 'center' }}>
                      {s.icon}
                    </View>
                    <View>
                      <Text style={{ fontSize: 20, fontWeight: '800', color: BLUE_600 }}>{s.count}</Text>
                      <Text style={{ fontSize: 10, color: BLUE_700, fontWeight: '600' }}>{s.label}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* ── Toggle — identical pill to index + post pages ── */}
              <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
                <View style={{ height: 56, backgroundColor: GRAY_MID, borderRadius: 50, flexDirection: 'row', alignItems: 'center', padding: 4 }}>
                  {(['lost', 'found'] as const).map(tab => (
                    <TouchableOpacity
                      key={tab}
                      onPress={() => setSelected(tab)}
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
                      <Text style={{ fontWeight: '700', fontSize: 14, color: selected === tab ? WHITE : DARK }}>
                        {tab === 'lost' ? 'Lost Items' : 'Found Items'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Result count */}
              {!isEmpty && !loading && (
                <Text style={{ fontSize: 13, color: GRAY_TXT, fontWeight: '500', paddingHorizontal: 20, marginBottom: 10 }}>
                  {filtered.length} item{filtered.length !== 1 ? 's' : ''} posted
                </Text>
              )}

              {/* Loading */}
              {loading && <ActivityIndicator size="large" color={BLUE_400} style={{ marginTop: 32 }} />}

              {/* Empty state */}
              {isEmpty && (
                <View style={{ alignItems: 'center', paddingVertical: 48, gap: 12 }}>
                  <Inbox size={52} color={BLUE_200} strokeWidth={1.5} />
                  <Text style={{ fontSize: 16, fontWeight: '700', color: GRAY_TXT }}>No {selected} items posted</Text>
                  <Text style={{ fontSize: 13, color: '#9CA3AF' }}>Items you report will appear here</Text>
                </View>
              )}
            </View>
          }

          // ── Item card — GRAY_BG bg, same as index page cards ──
          renderItem={({ item }) => (
            <Link href={`/items/${item.id}`} asChild>
              <TouchableOpacity activeOpacity={0.85} style={{ paddingHorizontal: 20, marginBottom: 12 }}>
                <View style={{ backgroundColor: GRAY_BG, borderRadius: 24, flexDirection: 'row', overflow: 'hidden' }}>
                  <Image
                    source={{ uri: item.image }}
                    style={{ width: 100, height: 110, borderTopLeftRadius: 24, borderBottomLeftRadius: 24 }}
                    resizeMode="cover"
                  />
                  <View style={{ flex: 1, padding: 14, justifyContent: 'space-between' }}>
                    {/* Name + badge */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: DARK, flex: 1, marginRight: 8 }} numberOfLines={1}>
                        {item.name}
                      </Text>
                      {/* BLUE_100 badge — same as index */}
                      <View style={{ backgroundColor: BLUE_100, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: BLUE_600 }}>{item.type.toUpperCase()}</Text>
                      </View>
                    </View>
                    {/* Description */}
                    <Text style={{ fontSize: 12, color: GRAY_TXT, lineHeight: 17, marginTop: 4 }} numberOfLines={2}>
                      {item.description}
                    </Text>
                    {/* Location */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                      <MapPin size={12} color="#9CA3AF" />
                      <Text style={{ fontSize: 12, color: '#9CA3AF', fontWeight: '500' }} numberOfLines={1}>{item.location}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </Link>
          )}
        />
      </View>
    </SafeAreaView>
    </>
  )
}