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

  // Check if user already has a team for this game
  const q = query(
    teamsRef,
    where('captainId', '==', userId),
    where('game', '==', teamData.game)
  )
  const existing = await getDocs(q)
  if (!existing.empty) {
    throw new Error(`You already manage a ${teamData.game} team. You can only captain one team per game.`)
  }

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

// Team Invites
export async function sendTeamInvite(teamId: string, email: string, inviterId: string) {
  const team = await getTeam(teamId)
  if (!team) throw new Error('Team not found')
  if (team.captainId !== inviterId) throw new Error('Only captain can invite')

  const invitesRef = collection(db, 'team_invites')
  // Check pending invites
  const q = query(
    invitesRef,
    where('teamId', '==', teamId),
    where('invitedEmail', '==', email),
    where('status', '==', 'pending')
  )
  const existing = await getDocs(q)
  if (!existing.empty) throw new Error('Already invited')

  const newRef = doc(invitesRef)
  await setDoc(newRef, {
    id: newRef.id,
    teamId,
    teamName: team.name,
    invitedEmail: email,
    inviterId,
    status: 'pending',
    createdAt: new Date()
  })
}

export async function getMyInvites(email: string) {
  const invitesRef = collection(db, 'team_invites')
  const q = query(
    invitesRef,
    where('invitedEmail', '==', email),
    where('status', '==', 'pending')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data())
}

export async function acceptTeamInvite(inviteId: string, userId: string) {
  const inviteRef = doc(db, 'team_invites', inviteId)
  const inviteSnap = await getDoc(inviteRef)
  if (!inviteSnap.exists()) throw new Error('Invite not found')
  const invite = inviteSnap.data()

  await updateDoc(inviteRef, { status: 'accepted' })
  await joinTeamWithCode(userId, invite.teamId)
}

// Join Requests
export async function requestToJoinTeam(
  teamId: string,
  userId: string,
  requestData: {
    diuId: string
    deviceType: string
    playingLevel: 'beginner' | 'intermediate' | 'advanced' | 'pro'
    experience: string
    gameName: string
  }
) {
  const team = await getTeam(teamId)
  if (!team) throw new Error('Team not found')
  if (team.memberIds.includes(userId)) throw new Error('Already a member')

  const userProfile = await getUserProfile(userId)
  if (!userProfile) throw new Error('User profile not found')

  const requestsRef = collection(db, 'join_requests')
  const q = query(
    requestsRef,
    where('teamId', '==', teamId),
    where('userId', '==', userId),
    where('status', '==', 'pending')
  )
  const existing = await getDocs(q)
  if (!existing.empty) throw new Error('Request already sent')

  const newRef = doc(requestsRef)
  await setDoc(newRef, {
    id: newRef.id,
    teamId,
    teamName: team.name,
    userId,
    userDisplayName: userProfile.displayName,
    userPhotoURL: userProfile.photoURL,
    diuId: requestData.diuId,
    deviceType: requestData.deviceType,
    playingLevel: requestData.playingLevel,
    experience: requestData.experience,
    gameName: requestData.gameName,
    status: 'pending',
    createdAt: new Date()
  })
}

export async function getTeamJoinRequests(teamId: string) {
  const requestsRef = collection(db, 'join_requests')
  const q = query(requestsRef, where('teamId', '==', teamId), where('status', '==', 'pending'))
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data())
}

export async function acceptJoinRequest(requestId: string) {
  const reqRef = doc(db, 'join_requests', requestId)
  const reqSnap = await getDoc(reqRef)
  if (!reqSnap.exists()) throw new Error('Request not found')
  const request = reqSnap.data()

  await updateDoc(reqRef, { status: 'accepted' })
  await joinTeamWithCode(request.userId, request.teamId)
}

export async function rejectJoinRequest(requestId: string) {
  const reqRef = doc(db, 'join_requests', requestId)
  const reqSnap = await getDoc(reqRef)
  if (!reqSnap.exists()) throw new Error('Request not found')

  await updateDoc(reqRef, { status: 'rejected' })
}

export async function respondToJoinRequest(requestId: string, status: 'accepted' | 'rejected') {
  const reqRef = doc(db, 'join_requests', requestId)
  const reqSnap = await getDoc(reqRef)
  if (!reqSnap.exists()) throw new Error('Request not found')
  const request = reqSnap.data()

  await updateDoc(reqRef, { status })

  if (status === 'accepted') {
    await joinTeamWithCode(request.userId, request.teamId)
  }
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
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Tournament)
}

export async function getTournament(id: string) {
  const docRef = doc(db, 'tournaments', id)
  const docSnap = await getDoc(docRef)
  return docSnap.exists() ? docSnap.data() as Tournament : null
}

export async function registerForTournament(tournamentId: string, teamId: string | null, userId: string) {
  const tournament = await getTournament(tournamentId)
  if (!tournament) throw new Error('Tournament not found')

  if (tournament.registeredTeams >= tournament.maxTeams) {
    throw new Error('Tournament is full')
  }

  // Strict Status Check
  // Assuming 'upcoming' means open. If we add 'closed' status later, check here.
  if (tournament.status !== 'upcoming') {
    throw new Error('Tournament registration is closed')
  }

  const regsRef = collection(db, 'tournament_registrations')

  // Check for existing registration
  let q;
  if (teamId) {
    q = query(
      regsRef,
      where('tournamentId', '==', tournamentId),
      where('teamId', '==', teamId)
    )
  } else {
    q = query(
      regsRef,
      where('tournamentId', '==', tournamentId),
      where('userId', '==', userId)
    )
  }

  const existing = await getDocs(q)
  if (!existing.empty) throw new Error('Already registered')

  // TEAM & FORMAT VALIDATION
  if (teamId) {
    const team = await getTeam(teamId);
    if (!team) throw new Error('Team not found');

    // 1. Check if team captain is performing the registration (userId)
    if (team.captainId !== userId) {
      throw new Error('Only the team captain can register the team');
    }

    // 2. Validate Team Size
    const currentMemberCount = team.members.length;

    // Use tournament.teamSize if available, otherwise infer from format
    let requiredSize = tournament.teamSize;
    if (!requiredSize || requiredSize === 0) {
      if (tournament.format === 'SOLO') requiredSize = 1;
      else if (tournament.format === 'DUO') requiredSize = 2;
      else if (tournament.format === 'TRIO') requiredSize = 3;
      else if (tournament.format === 'SQUAD') requiredSize = 4; // Default to 4 for Squad if not specified? 
      // Note: Some squads are 5. Safest to enforce tournament.teamSize which Admin sets.
    }

    // Enforce strict size if we have a requirement
    if (requiredSize && currentMemberCount !== requiredSize) {
      throw new Error(`Invalid team size. ${tournament.format} tournament requires exactly ${requiredSize} players. Your team has ${currentMemberCount}.`);
    }

    // 3. Validate Format Compatibility (optional if handled by size, but good for sanity)
    // e.g. Don't let a 1-man team register for SQUAD even if logic above slipped
    if (tournament.format === 'SOLO' && currentMemberCount !== 1) throw new Error("Solo tournaments require a team of 1 (Individual).");
    if (tournament.format === 'DUO' && currentMemberCount !== 2) throw new Error("Duo tournaments require exactly 2 players.");
  } else {
    // Solo registration without a team structure (legacy/direct support)
    if (tournament.format !== 'SOLO') {
      throw new Error('This tournament requires a Team to register.');
    }
  }

  const newRegRef = doc(regsRef)
  const reg: TournamentRegistration = {
    id: newRegRef.id,
    tournamentId,
    // @ts-ignore
    teamId: teamId || null,
    userId,
    status: 'approved',
    createdAt: new Date()
  }

  await setDoc(newRegRef, reg)

  await updateDoc(doc(db, 'tournaments', tournamentId), {
    registeredTeams: increment(1)
  })
}

export async function getTournamentMatches(tournamentId: string) {
  const matchesRef = collection(db, 'matches')
  const q = query(matchesRef, where('tournamentId', '==', tournamentId), orderBy('matchNumber', 'asc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => doc.data() as Match)
}

export async function updateMatchResult(matchId: string, scoreA: number, scoreB: number, winnerId: string | null) {
  const matchRef = doc(db, 'matches', matchId)

  await updateDoc(matchRef, {
    scoreA,
    scoreB,
    winnerId,
    status: 'COMPLETED'
  })
} 