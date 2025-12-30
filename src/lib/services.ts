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
  writeBatch
} from 'firebase/firestore'
import { db, auth } from './firebase'
import type { UserProfile, Post, Comment, Statistics, Team, TeamMember, Tournament, Match, TournamentRegistration } from './models'

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

// Team Services
export async function createTeam(
  userId: string,
  teamData: Omit<Team, 'id' | 'captainId' | 'members' | 'memberIds' | 'stats' | 'createdAt' | 'updatedAt'>
) {
  const userProfile = await getUserProfile(userId)
  if (!userProfile) throw new Error('User not found')

  const teamsRef = collection(db, 'teams')
  const newTeamRef = doc(teamsRef)

  const captain: TeamMember = {
    userId,
    displayName: userProfile.displayName,
    photoURL: userProfile.photoURL,
    role: 'captain',
    joinedAt: new Date()
  }

  const newTeam: Team = {
    id: newTeamRef.id,
    ...teamData,
    captainId: userId,
    members: [captain],
    memberIds: [userId],
    invites: [],
    stats: {
      wins: 0,
      losses: 0,
      matchesPlayed: 0
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }

  await setDoc(newTeamRef, newTeam)
  return newTeam
}

export async function getTeam(teamId: string) {
  const teamRef = doc(db, 'teams', teamId)
  const teamSnap = await getDoc(teamRef)
  return teamSnap.exists() ? teamSnap.data() as Team : null
}

export async function getAllTeams() {
  const teamsRef = collection(db, 'teams')
  const q = query(teamsRef, orderBy('createdAt', 'desc'))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => doc.data() as Team)
}

export async function getMyTeams(userId: string) {
  const teamsRef = collection(db, 'teams')
  const q = query(teamsRef, where('memberIds', 'array-contains', userId))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => doc.data() as Team)
}

export async function joinTeamWithCode(userId: string, teamId: string) {
  const userProfile = await getUserProfile(userId)
  if (!userProfile) throw new Error('User not found')

  const teamRef = doc(db, 'teams', teamId)
  const teamSnap = await getDoc(teamRef)
  if (!teamSnap.exists()) throw new Error('Team not found')

  const team = teamSnap.data() as Team

  if (team.memberIds.includes(userId)) {
    throw new Error('Already a member')
  }

  const newMember: TeamMember = {
    userId,
    displayName: userProfile.displayName,
    photoURL: userProfile.photoURL,
    role: 'member',
    joinedAt: new Date()
  }

  await updateDoc(teamRef, {
    members: arrayUnion(newMember),
    memberIds: arrayUnion(userId)
  })
}

export async function leaveTeam(userId: string, teamId: string) {
  const teamRef = doc(db, 'teams', teamId)
  const teamSnap = await getDoc(teamRef)
  if (!teamSnap.exists()) throw new Error('Team not found')

  const team = teamSnap.data() as Team
  const memberToRemove = team.members.find(m => m.userId === userId)

  if (!memberToRemove) throw new Error('Not a member')

  if (memberToRemove.role === 'captain') {
    throw new Error('Captain cannot leave. Disband team or transfer leadership.')
  }

  await updateDoc(teamRef, {
    members: arrayRemove(memberToRemove),
    memberIds: arrayRemove(userId)
  })
}

// Tournament Services
export async function createTournament(data: Omit<Tournament, 'id' | 'registeredTeams' | 'status'>) {
  const tournamentsRef = collection(db, 'tournaments')
  const newRef = doc(tournamentsRef)

  const tournament: Tournament = {
    id: newRef.id,
    ...data,
    registeredTeams: 0,
    status: 'upcoming'
  }

  await setDoc(newRef, tournament)
  return tournament
}

export async function getTournaments() {
  const tournamentsRef = collection(db, 'tournaments')
  const q = query(tournamentsRef, orderBy('startDate', 'asc'))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => doc.data() as Tournament)
}

export async function getTournament(id: string) {
  const docRef = doc(db, 'tournaments', id)
  const docSnap = await getDoc(docRef)
  return docSnap.exists() ? docSnap.data() as Tournament : null
}

export async function registerForTournament(tournamentId: string, teamId: string, userId: string) {
  const tournament = await getTournament(tournamentId)
  if (!tournament) throw new Error('Tournament not found')

  if (tournament.registeredTeams >= tournament.maxTeams) {
    throw new Error('Tournament is full')
  }

  const regsRef = collection(db, 'tournament_registrations')
  const q = query(
    regsRef,
    where('tournamentId', '==', tournamentId),
    where('teamId', '==', teamId)
  )
  const existing = await getDocs(q)
  if (!existing.empty) throw new Error('Team already registered')

  const newRegRef = doc(regsRef)
  const reg: TournamentRegistration = {
    id: newRegRef.id,
    tournamentId,
    teamId,
    userId,
    status: 'approved',
    createdAt: new Date()
  }

  await setDoc(newRegRef, reg)

  await updateDoc(doc(db, 'tournaments', tournamentId), {
    registeredTeams: increment(1)
  })
}

// Bracket Logic
export async function generateBracket(tournamentId: string) {
  const tournament = await getTournament(tournamentId)
  if (!tournament) throw new Error('Tournament not found')

  const regsRef = collection(db, 'tournament_registrations')
  const q = query(regsRef, where('tournamentId', '==', tournamentId))
  const regSnaps = await getDocs(q)
  const registrations = regSnaps.docs.map(d => d.data() as TournamentRegistration)

  if (registrations.length < 2) throw new Error('Not enough teams to generate bracket')

  const matches: Match[] = []
  const batch = writeBatch(db)

  if (tournament.type === 'ELIMINATION') {
    const shuffled = registrations.sort(() => Math.random() - 0.5)
    const teamCount = shuffled.length
    let powerOf2 = 2
    while (powerOf2 < teamCount) powerOf2 *= 2

    const byes = powerOf2 - teamCount
    const round1Matches = teamCount - byes

    let matchNum = 1
    for (let i = 0; i < round1Matches; i += 2) {
      const newMatchRef = doc(collection(db, 'matches'))
      const match: Match = {
        id: newMatchRef.id,
        tournamentId,
        type: 'ELIMINATION',
        round: 1,
        matchNumber: matchNum++,
        status: 'SCHEDULED',
        teamAId: shuffled[i].teamId,
        teamBId: shuffled[i + 1].teamId,
        scoreA: 0,
        scoreB: 0,
        startTime: tournament.startDate
      }
      batch.set(newMatchRef, match)
    }

  } else {
    const newMatchRef = doc(collection(db, 'matches'))
    const match: Match = {
      id: newMatchRef.id,
      tournamentId,
      type: 'BATTLE_ROYALE',
      round: 1,
      matchNumber: 1,
      status: 'SCHEDULED',
      participants: registrations.map(r => r.teamId!),
      results: [],
      startTime: tournament.startDate
    }
    batch.set(newMatchRef, match)
  }

  await updateDoc(doc(db, 'tournaments', tournamentId), {
    status: 'ongoing'
  })

  await batch.commit()
}

export async function getTournamentMatches(tournamentId: string) {
  const matchesRef = collection(db, 'matches')
  const q = query(matchesRef, where('tournamentId', '==', tournamentId), orderBy('matchNumber', 'asc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => doc.data() as Match)
} 