import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore'
import { db, auth } from './firebase'
import type { UserProfile, Post, Comment, Statistics } from './models'

// User Services
export async function createUserProfile(uid: string, email: string) {
  const userRef = doc(db, 'users', uid)
  const userProfile: UserProfile = {
    uid,
    email,
    displayName: email.split('@')[0],
    photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`,
    role: 'user',
    createdAt: new Date(),
    lastLogin: new Date(),
  }
  await setDoc(userRef, userProfile)
  return userProfile
}

export async function getUserProfile(uid: string) {
  const userRef = doc(db, 'users', uid)
  const userSnap = await getDoc(userRef)
  return userSnap.exists() ? userSnap.data() as UserProfile : null
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  const userRef = doc(db, 'users', uid)
  await updateDoc(userRef, { ...data, lastLogin: new Date() })
}

// Post Services
export async function createPost(userId: string, imageUrl: string, caption: string) {
  const postsRef = collection(db, 'posts')
  const userProfile = await getUserProfile(userId)
  if (!userProfile) throw new Error('User not found')

  const post: Post = {
    id: doc(postsRef).id,
    userId,
    userDisplayName: userProfile.displayName,
    userPhotoURL: userProfile.photoURL,
    imageUrl,
    caption,
    likes: [],
    likesCount: 0,
    comments: [],
    createdAt: new Date(),
  }

  await setDoc(doc(postsRef, post.id), post)
  return post
}

export async function getPosts() {
  const postsRef = collection(db, 'posts')
  const q = query(postsRef, orderBy('createdAt', 'desc'))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => doc.data() as Post)
}

export async function likePost(postId: string, userId: string) {
  const postRef = doc(db, 'posts', postId)
  await updateDoc(postRef, {
    likes: arrayUnion(userId),
    likesCount: increment(1),
  })
}

export async function unlikePost(postId: string, userId: string) {
  const postRef = doc(db, 'posts', postId)
  await updateDoc(postRef, {
    likes: arrayRemove(userId),
    likesCount: increment(-1),
  })
}

export async function addComment(postId: string, userId: string, content: string) {
  const postRef = doc(db, 'posts', postId)
  const userProfile = await getUserProfile(userId)
  if (!userProfile) throw new Error('User not found')

  const comment: Comment = {
    id: Math.random().toString(36).substr(2, 9),
    userId,
    userDisplayName: userProfile.displayName,
    userPhotoURL: userProfile.photoURL,
    content,
    createdAt: new Date(),
  }

  await updateDoc(postRef, {
    comments: arrayUnion(comment),
  })

  return comment
}

// Statistics Services
export async function incrementStatistic(field: keyof Statistics) {
  const statsRef = doc(db, 'statistics', 'global')
  const statsSnap = await getDoc(statsRef)

  if (!statsSnap.exists()) {
    // Initialize statistics if they don't exist
    await setDoc(statsRef, {
      totalVisitors: 0,
      activeUsers: 0,
      totalTournaments: 0,
      lastUpdated: serverTimestamp(),
    })
  }

  await updateDoc(statsRef, {
    [field]: increment(1),
    lastUpdated: serverTimestamp(),
  })
}

export async function getStatistics() {
  const statsRef = doc(db, 'statistics', 'global')
  const statsSnap = await getDoc(statsRef)
  return statsSnap.exists() ? statsSnap.data() as Statistics : null
}

// Admin Services
export async function isAdmin(uid: string) {
  const userProfile = await getUserProfile(uid)
  return userProfile?.role === 'admin'
}

// User Session Management
export async function updateLastLogin(uid: string) {
  const userRef = doc(db, 'users', uid)
  await updateDoc(userRef, {
    lastLogin: serverTimestamp(),
  })
  await incrementStatistic('activeUsers')
} 