import { View, Text, Alert, Modal, TextInput, ScrollView, Switch, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { onSnapshot, doc, getDoc, updateDoc, collection, addDoc, serverTimestamp, query, where } from "firebase/firestore"
import { db, authi } from "../../firebase"
import { Image } from 'react-native'
import { signOut, updateProfile } from 'firebase/auth'
import { router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  User, Pencil, Camera, LogOut, Settings,
  MessageSquare, Activity, ChevronRight, Bell, Check
} from 'lucide-react-native'


// Same palette as index + post pages
const BLUE_400  = "#60A5FA"
const BLUE_100  = "#DBEAFE"
const BLUE_200  = "#BFDBFE"
const BLUE_600  = "#2563EB"
const GRAY_BG   = "#F3F4F6"
const GRAY_MID  = "#E4E4E4"
const GRAY_TXT  = "#6B7280"
const DARK      = "#1F2937"
const WHITE     = "#FFFFFF"
const RED       = "#EF4444"
const RED_BG    = "#FEF2F2"

const logout = async () => {
  try {
    await signOut(authi)
    router.replace("/AuthScreen")
  } catch (error) {
    console.error("Error signing out:", error)
  }
}

const ProfilePage = () => {
  const user = authi.currentUser

  const [phone, setPhone]               = useState("")
  const [profilePic, setProfilePic]     = useState<string | null>(user?.photoURL || null)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editName, setEditName]         = useState(user?.displayName || "")
  const [editPhone, setEditPhone]       = useState("")
  const [settingsVisible, setSettingsVisible] = useState(false)
  const [feedbackVisible, setFeedbackVisible] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [notifEnabled, setNotifEnabled] = useState(true)
  const [itemCount, setItemCount]       = useState({ lost: 0, found: 0 })

  useEffect(() => {
    if (!authi.currentUser) return
    const q = query(collection(db, "items"), where("ownerUid", "==", authi.currentUser.uid))
    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[]
      setItemCount({
        lost:  all.filter(i => i.type === "lost").length,
        found: all.filter(i => i.type === "found").length,
      })
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      if (!authi.currentUser) return
      const snap = await getDoc(doc(db, "users", authi.currentUser.uid))
      if (snap.exists()) {
        const data = snap.data()
        setPhone(data.phone || "")
        setEditPhone(data.phone || "")
        if (data.photoURL) setProfilePic(data.photoURL)
      }
    }
    fetchUser()
  }, [])

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) { Alert.alert("Permission needed", "Please allow photo access."); return }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.6,
    })
    if (!result.canceled) {
      const uri = result.assets[0].uri
      setProfilePic(uri)
      try {
        if (authi.currentUser) {
          await updateProfile(authi.currentUser, { photoURL: uri })
          await updateDoc(doc(db, "users", authi.currentUser.uid), { photoURL: uri })
        }
      } catch { Alert.alert("Error", "Could not update profile picture.") }
    }
  }

  const saveProfile = async () => {
    try {
      if (authi.currentUser) {
        await updateProfile(authi.currentUser, { displayName: editName })
        await updateDoc(doc(db, "users", authi.currentUser.uid), { phone: editPhone })
      }
      setPhone(editPhone)
      setEditModalVisible(false)
    } catch { Alert.alert("Error", "Could not save changes.") }
  }

  const submitFeedback = async () => {
    if (!feedbackText.trim()) { Alert.alert("Empty feedback", "Please write something first."); return }
    try {
      await addDoc(collection(db, "feedback"), {
        uid: authi.currentUser?.uid || null,
        name: user?.displayName || "Anonymous",
        text: feedbackText.trim(),
        createdAt: serverTimestamp(),
      })
      setFeedbackText("")
      setFeedbackVisible(false)
      Alert.alert("Thank you!", "Your feedback has been submitted.")
    } catch { Alert.alert("Error", "Could not submit feedback.") }
  }

  const initials = (user?.displayName || "U").charAt(0).toUpperCase()

  // Reusable menu row
  const MenuItem = ({ icon, label, onPress, danger = false, rightElement }: any) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: WHITE,
        paddingHorizontal: 16, paddingVertical: 15,
        borderRadius: 18,
      }}
    >
      <View style={{
        height: 38, width: 38, borderRadius: 12,
        backgroundColor: danger ? RED_BG : BLUE_100,
        alignItems: 'center', justifyContent: 'center',
      }}>
        {React.cloneElement(icon, { size: 17, color: danger ? RED : BLUE_600 })}
      </View>
      <Text style={{
        flex: 1, marginLeft: 14, fontSize: 15, fontWeight: '600',
        color: danger ? RED : DARK,
      }}>
        {label}
      </Text>
      {rightElement ?? (
        !danger && <ChevronRight size={17} color={GRAY_MID} />
      )}
    </TouchableOpacity>
  )

  return (
 <SafeAreaView style={{ flex: 1, backgroundColor: BLUE_400 }} edges={['top']}>
      <View style={{ flex: 1, backgroundColor: GRAY_BG }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
 
          {/* ── Blue Header ── */}
          <View style={{
            backgroundColor: BLUE_400,
            borderBottomLeftRadius: 36,
            borderBottomRightRadius: 36,
            alignItems: 'center',
            paddingTop: Platform.OS === 'android' ? 16 : 8,
            paddingBottom: 44,                 // ← extra room for bigger avatar
            paddingHorizontal: 20,
          }}>
            {/* Top bar */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 24 }}>
              <Text style={{ color: WHITE, fontSize: 18, fontWeight: '700' }}>Profile</Text>
              <TouchableOpacity
                style={{
                  height: 38, width: 38, borderRadius: 19,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center', justifyContent: 'center',
                }}
                onPress={() => setSettingsVisible(true)}
              >
                <Settings size={18} color={WHITE} />
              </TouchableOpacity>
            </View>
 
            {/* Avatar — LARGER: 120×120 */}
            <TouchableOpacity onPress={pickImage} activeOpacity={0.85} style={{ position: 'relative', marginBottom: 14 }}>
              <View style={{
                height: 120, width: 120, borderRadius: 60,   // ← was 96/48
                backgroundColor: BLUE_200,
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 3, borderColor: WHITE,
                overflow: 'hidden',
              }}>
                {profilePic
                  ? <Image source={{ uri: profilePic }} style={{ height: 120, width: 120 }} />
                  : <Text style={{ fontSize: 48, fontWeight: '800', color: BLUE_600 }}>{initials}</Text>
                }
              </View>
              <View style={{
                position: 'absolute', bottom: 0, right: 0,
                height: 32, width: 32, borderRadius: 16,     // ← slightly bigger badge too
                backgroundColor: BLUE_600,
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 2, borderColor: WHITE,
              }}>
                <Camera size={15} color={WHITE} />
              </View>
            </TouchableOpacity>
 
            {/* Name — LARGER: fontSize 26 */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Text style={{ color: WHITE, fontSize: 26, fontWeight: '800' }}>   {/* ← was 20 */}
                {user?.displayName || "Add your name"}
              </Text>
              <TouchableOpacity
                onPress={() => { setEditName(user?.displayName || ""); setEditPhone(phone); setEditModalVisible(true) }}
                style={{
                  height: 26, width: 26, borderRadius: 13,
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Pencil size={12} color={WHITE} />
              </TouchableOpacity>
            </View>
 
            {/* Phone — LARGER: fontSize 16 */}
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>  {/* ← was 13 */}
              {phone || "No phone number added"}
            </Text>
          </View>

          {/* ── Stats strip (lifted, overlapping the curve) ── */}
          <View style={{
            flexDirection: 'row', gap: 12,
            marginHorizontal: 20,
            marginTop: -24,
            marginBottom: 20,
          }}>
            {[
              { label: 'Lost Posted', value: itemCount.lost },
              { label: 'Found Posted', value: itemCount.found },
              { label: 'Total', value: itemCount.lost + itemCount.found },
            ].map((stat, i) => (
              <View key={i} style={{
                flex: 1, backgroundColor: WHITE,
                borderRadius: 18, paddingVertical: 14,
                alignItems: 'center',
                shadowColor: BLUE_400,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}>
                <Text style={{ fontSize: 22, fontWeight: '800', color: BLUE_600 }}>{stat.value}</Text>
                <Text style={{ fontSize: 10, color: GRAY_TXT, fontWeight: '600', marginTop: 2 }}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* ── Menu sections ── */}
          <View style={{ paddingHorizontal: 20, gap: 10 }}>

            {/* Account */}
            <Text style={{ fontSize: 11, fontWeight: '700', color: GRAY_TXT, letterSpacing: 0.8, marginLeft: 4, marginBottom: 2 }}>
              ACCOUNT
            </Text>
            <View style={{ gap: 2, backgroundColor: WHITE, borderRadius: 20, overflow: 'hidden' }}>
              <MenuItem
                icon={<User />}
                label="Edit Profile"
                onPress={() => { setEditName(user?.displayName || ""); setEditPhone(phone); setEditModalVisible(true) }}
              />
              <View style={{ height: 1, backgroundColor: GRAY_BG, marginHorizontal: 16 }} />
              <MenuItem
                icon={<Activity />}
                label="My Activity"
                onPress={() => router.push("/activity")}
              />
            </View>

            {/* Support */}
            <Text style={{ fontSize: 11, fontWeight: '700', color: GRAY_TXT, letterSpacing: 0.8, marginLeft: 4, marginTop: 8, marginBottom: 2 }}>
              SUPPORT
            </Text>
            <View style={{ gap: 2, backgroundColor: WHITE, borderRadius: 20, overflow: 'hidden' }}>
              <MenuItem
                icon={<Bell />}
                label="Notifications"
                onPress={() => setSettingsVisible(true)}
                rightElement={
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontSize: 12, color: GRAY_TXT }}>{notifEnabled ? 'On' : 'Off'}</Text>
                    <ChevronRight size={17} color={GRAY_MID} />
                  </View>
                }
              />
              <View style={{ height: 1, backgroundColor: GRAY_BG, marginHorizontal: 16 }} />
              <MenuItem
                icon={<MessageSquare />}
                label="Send Feedback"
                onPress={() => setFeedbackVisible(true)}
              />
            </View>

            {/* Danger */}
            <View style={{ marginTop: 8, backgroundColor: WHITE, borderRadius: 20, overflow: 'hidden' }}>
              <MenuItem
                icon={<LogOut />}
                label="Log Out"
                danger
                onPress={logout}
              />
            </View>

          </View>
        </ScrollView>
      </View>

      {/* ── Edit Profile Modal ── */}
      <Modal visible={editModalVisible} animationType="slide" transparent onRequestClose={() => setEditModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: WHITE, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 16 }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: GRAY_MID, alignSelf: 'center', marginBottom: 4 }} />
            <Text style={{ fontSize: 18, fontWeight: '800', color: DARK }}>Edit Profile</Text>

            {[
              { label: 'Name', value: editName, setter: setEditName, placeholder: 'Your name', keyboard: 'default' },
              { label: 'Phone', value: editPhone, setter: setEditPhone, placeholder: 'Your phone number', keyboard: 'phone-pad' },
            ].map(f => (
              <View key={f.label} style={{ gap: 6 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: GRAY_TXT }}>{f.label.toUpperCase()}</Text>
                <TextInput
                  value={f.value}
                  onChangeText={f.setter}
                  placeholder={f.placeholder}
                  placeholderTextColor="#9CA3AF"
                  keyboardType={f.keyboard as any}
                  style={{
                    height: 52, borderWidth: 1.5,
                    borderColor: f.value ? BLUE_400 : GRAY_MID,
                    borderRadius: 14, paddingHorizontal: 16,
                    fontSize: 15, color: DARK,
                  }}
                />
              </View>
            ))}

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={{ flex: 1, height: 52, borderRadius: 50, backgroundColor: GRAY_BG, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontWeight: '700', color: GRAY_TXT }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveProfile} style={{ flex: 1, height: 52, borderRadius: 50, backgroundColor: BLUE_400, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontWeight: '700', color: WHITE }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Settings Modal ── */}
      <Modal visible={settingsVisible} animationType="slide" transparent onRequestClose={() => setSettingsVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: WHITE, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 16 }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: GRAY_MID, alignSelf: 'center', marginBottom: 4 }} />
            <Text style={{ fontSize: 18, fontWeight: '800', color: DARK }}>Settings</Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: GRAY_BG, padding: 16, borderRadius: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: BLUE_100, alignItems: 'center', justifyContent: 'center' }}>
                  <Bell size={16} color={BLUE_600} />
                </View>
                <Text style={{ fontWeight: '600', color: DARK, fontSize: 15 }}>Push Notifications</Text>
              </View>
              <Switch
                value={notifEnabled}
                onValueChange={setNotifEnabled}
                trackColor={{ false: GRAY_MID, true: BLUE_400 }}
                thumbColor={WHITE}
              />
            </View>

            <TouchableOpacity onPress={() => setSettingsVisible(false)} style={{ height: 52, borderRadius: 50, backgroundColor: BLUE_400, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontWeight: '700', color: WHITE }}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Feedback Modal ── */}
      <Modal visible={feedbackVisible} animationType="slide" transparent onRequestClose={() => setFeedbackVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: WHITE, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 16 }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: GRAY_MID, alignSelf: 'center', marginBottom: 4 }} />
            <Text style={{ fontSize: 18, fontWeight: '800', color: DARK }}>Send Feedback</Text>

            <TextInput
              value={feedbackText}
              onChangeText={setFeedbackText}
              placeholder="Tell us what you think or report an issue..."
              placeholderTextColor="#9CA3AF"
              multiline
              style={{
                borderWidth: 1.5, borderColor: feedbackText ? BLUE_400 : GRAY_MID,
                borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
                height: 120, fontSize: 14, color: DARK, textAlignVertical: 'top',
              }}
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={() => setFeedbackVisible(false)} style={{ flex: 1, height: 52, borderRadius: 50, backgroundColor: GRAY_BG, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontWeight: '700', color: GRAY_TXT }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={submitFeedback} style={{ flex: 1, height: 52, borderRadius: 50, backgroundColor: BLUE_400, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontWeight: '700', color: WHITE }}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  )
}

export default ProfilePage