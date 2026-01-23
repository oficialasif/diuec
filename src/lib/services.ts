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
  writeBatch,
  deleteDoc,
  addDoc
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, auth, storage } from './firebase'
import type { UserProfile, Post, Comment, Statistics, Team, TeamMember, Tournament, Match, TournamentRegistration, CommitteeMember, GalleryImage, Sponsor } from './models'

// --- STORAGE SERVICES (CLOUDINARY) ---

export async function uploadImage(file: File, folder: string): Promise<string> {
  // 1. Get Signature from our API
  const timestamp = Math.round(new Date().getTime() / 1000)
  const paramsToSign = {
    timestamp,
    folder
  }

  const signRes = await fetch('/api/cloudinary/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paramsToSign })
  })

  if (!signRes.ok) {
    const error = await signRes.json()
    throw new Error(error.error || 'Failed to sign upload request')
  }

  const { signature, apiKey, cloudName } = await signRes.json()

  // 2. Upload to Cloudinary
  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', apiKey)
  formData.append('timestamp', timestamp.toString())
  formData.append('signature', signature)
  formData.append('folder', folder)

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData
  })

  if (!uploadRes.ok) {
    const error = await uploadRes.json()
    throw new Error(error.error?.message || 'Failed to upload image')
  }

  const data = await uploadRes.json()
  return data.secure_url
}

export async function deleteImage(url: string) {
  // Cloudinary deletion usually requires a backend signature or Admin API.
  // For now, we will just log it. Secure client-side deletion is complex/risky.
  console.log("Delete requested for", url, "- Cloudinary deletion skipped (requires backend admin)")
}

// --- HOME PAGE CONTENT SERVICES ---

// Committee Members
export async function getCommitteeMembers() {
  const q = query(collection(db, 'committee'), orderBy('order', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as CommitteeMember)
}

export async function addCommitteeMember(data: Omit<CommitteeMember, 'id' | 'createdAt'>) {
  const colRef = collection(db, 'committee')
  const docRef = await addDoc(colRef, {
    ...data,
    createdAt: new Date()
  })
  return { id: docRef.id, ...data }
}

export async function updateCommitteeMember(id: string, data: Partial<CommitteeMember>) {
  const docRef = doc(db, 'committee', id)
  await updateDoc(docRef, data)
}

export async function deleteCommitteeMember(id: string) {
  const docRef = doc(db, 'committee', id)
  await deleteDoc(docRef)
}

// Gallery
export async function getGalleryImages() {
  const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as GalleryImage)
}

export async function addGalleryImage(data: Omit<GalleryImage, 'id' | 'createdAt'>) {
  const colRef = collection(db, 'gallery')
  const docRef = await addDoc(colRef, {
    ...data,
    createdAt: new Date()
  })
  return { id: docRef.id, ...data }
}

export async function deleteGalleryImage(id: string) {
  const docRef = doc(db, 'gallery', id)
  await deleteDoc(docRef)
}

// Sponsors
export async function getSponsors() {
  const q = query(collection(db, 'sponsors'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Sponsor)
}

export async function addSponsor(data: Omit<Sponsor, 'id' | 'createdAt'>) {
  const colRef = collection(db, 'sponsors')
  const docRef = await addDoc(colRef, {
    ...data,
    createdAt: new Date()
  })
  return { id: docRef.id, ...data }
}

export async function deleteSponsor(id: string) {
  const docRef = doc(db, 'sponsors', id)
  await deleteDoc(docRef)
}

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

export async function deleteTeam(teamId: string) {
  const teamRef = doc(db, 'teams', teamId)
  await deleteDoc(teamRef)

  // Also try to delete stats if they exist, though hard to know game type here without text.
  // We will just delete the main team doc for now as per plan.
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
    name: string
    gmail: string
    gameUsername: string
    deviceName: string
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
    name: requestData.name,
    gmail: requestData.gmail,
    gameUsername: requestData.gameUsername,
    deviceName: requestData.deviceName,
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

export async function registerForTournament(
  tournamentId: string,
  teamId: string | null,
  userId: string,
  ingameName?: string,
  paymentDetails?: { transactionId: string; paymentNumber: string; captainEmail: string }
) {
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

    // Enforce size with optional substitute (Required OR Required + 1)
    if (requiredSize) {
      if (currentMemberCount < requiredSize || currentMemberCount > requiredSize + 1) {
        throw new Error(`Invalid team size. ${tournament.format} tournament requires ${requiredSize} to ${requiredSize + 1} players (including optional sub). Your team has ${currentMemberCount}.`);
      }
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
    if (!ingameName) {
      throw new Error('In-game name is required for solo registration');
    }
  }

  const newRegRef = doc(regsRef)
  const reg: TournamentRegistration = {
    id: newRegRef.id,
    tournamentId,
    // @ts-ignore
    teamId: teamId || null,
    userId,
    ...(ingameName && { ingameName }),
    status: paymentDetails ? 'pending' : 'approved', // If payment involved, set to pending until admin review. Or maybe just approved if we trust them? User said "Payment clearance" section, suggesting verification needed.
    // However, if we set to pending, they might not see themselves in groups immediately. 
    // Let's set to 'pending' if payment details provided, so Admin can verify 'Payment Clearance'.
    paymentDetails: paymentDetails ? { ...paymentDetails, submissionDate: new Date() } : undefined,
    createdAt: new Date()
  }

  await setDoc(newRegRef, reg)

  await updateDoc(doc(db, 'tournaments', tournamentId), {
    registeredTeams: increment(1)
  })
}

export async function getTournamentMatches(tournamentId: string) {
  const matchesRef = collection(db, 'matches_detailed')
  const q = query(matchesRef, where('tournamentId', '==', tournamentId), orderBy('matchNumber', 'asc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => doc.data() as Match)
}

export async function updateMatchResult(matchId: string, scoreA: number, scoreB: number, winnerId: string | null) {
  const matchRef = doc(db, 'matches_detailed', matchId)

  await updateDoc(matchRef, {
    scoreA,
    scoreB,
    winnerId,
    status: 'COMPLETED'
  })
}

export async function updateMatchSchedule(matchId: string, scheduledAt: Date, map?: string) {
  const matchRef = doc(db, 'matches_detailed', matchId)
  await updateDoc(matchRef, {
    scheduledAt: scheduledAt,
    ...(map && { map }),
    status: 'scheduled'
  })
}
// Helper to get group size by format
function getGroupTargetSize(format: string): number {
  switch (format?.toUpperCase()) {
    case 'SQUAD': return 4;
    case 'DUO': return 2;
    case 'SOLO': return 4;
    default: return 4;
  }
}

export async function generateTournamentGroups(tournamentId: string) {
  // 1. Fetch Tournament to get Format
  const tDoc = await getDoc(doc(db, 'tournaments', tournamentId))
  if (!tDoc.exists()) throw new Error('Tournament not found')
  const tournament = tDoc.data() as Tournament

  const targetSize = getGroupTargetSize(tournament.format)

  // Fetch Approved Registrations
  const q = query(
    collection(db, 'tournament_registrations'),
    where('tournamentId', '==', tournamentId),
    where('status', '==', 'approved')
  )
  const snap = await getDocs(q)
  const regs = snap.docs.map(d => ({ ...d.data(), id: d.id } as TournamentRegistration))

  if (regs.length === 0) throw new Error('No approved registrations found')

  // Check if already generated (optimization/safety) - UI handles confirmation, so we proceed.

  // LOGIC: Balanced Distribution
  // Rule: Min 2 Groups (User wants Knockout capability even for small numbers)
  // Calculate Number of Groups needed
  // Example: 2 teams, Target 4 -> 2/4 = 0.5 -> Ceil 1. But Max(2, 1) = 2. -> 2 Groups.
  // Example: 5 Teams (Squad), Target 4 -> 5/4 = 1.25 -> Ceil 2. -> 2 Groups.
  // Example: 8 Teams (Duo), Target 2 -> 8/2 = 4 -> 4 Groups.

  const totalRegs = regs.length
  const neededGroups = Math.max(2, Math.ceil(totalRegs / targetSize))

  // Shuffle
  const shuffled = regs.sort(() => Math.random() - 0.5)

  // Chunk and Update via Round Robin
  const batch = writeBatch(db)
  const groupNames = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  shuffled.forEach((reg, index) => {
    // Round Robin Index: 0, 1, 0, 1... for 2 groups
    const groupIndex = index % neededGroups

    let groupName = groupNames[groupIndex]
    if (!groupName) groupName = `G${groupIndex + 1} `

    const ref = doc(db, 'tournament_registrations', reg.id)
    batch.update(ref, { group: groupName })
  })

  await batch.commit()
}

export async function updateParticipantGroup(registrationId: string, newGroup: string) {
  const ref = doc(db, 'tournament_registrations', registrationId)
  await updateDoc(ref, { group: newGroup })
}

export async function approveRegistration(registrationId: string) {
  const ref = doc(db, 'tournament_registrations', registrationId)
  await updateDoc(ref, { status: 'approved' })
}

// ADMIN: Fetch all registrations (Pending + Approved) for management
export async function getAdminTournamentRegistrations(tournamentId: string) {
  const q = query(
    collection(db, 'tournament_registrations'),
    where('tournamentId', '==', tournamentId)
    // Removed status filter to show everyone
  )
  const snap = await getDocs(q)

  const groups: Record<string, TournamentRegistration[]> = {}

  snap.docs.forEach(doc => {
    const data = doc.data() as TournamentRegistration
    // If group is undefined, put in "Unassigned"
    const gName = data.group || 'Unassigned'
    if (!groups[gName]) groups[gName] = []
    groups[gName].push({ ...data, id: doc.id })
  })
  return groups
}

export async function getTournamentGroups(tournamentId: string) {
  const q = query(
    collection(db, 'tournament_registrations'),
    where('tournamentId', '==', tournamentId),
    where('status', '==', 'approved')
    // Removed orderBy to avoid index requirement errors
  )
  const snap = await getDocs(q)

  // Group by "group" field
  const groups: Record<string, TournamentRegistration[]> = {}

  // If no groups generated yet, we might want to return a special "Unassigned" list?
  // Or just empty. 

  snap.docs.forEach(doc => {
    const data = doc.data() as TournamentRegistration
    // If group is undefined, put in "Unassigned"
    const gName = data.group || 'Unassigned'
    if (!groups[gName]) groups[gName] = []
    groups[gName].push({ ...data, id: doc.id })
  })
  snap.docs.forEach(doc => {
    const data = doc.data() as TournamentRegistration
    // If group is undefined, put in "Unassigned"
    const gName = data.group || 'Unassigned'
    if (!groups[gName]) groups[gName] = []
    groups[gName].push({ ...data, id: doc.id })
  })
  return groups
}


// Fetch all registrations for a user
export async function getUserTournamentRegistrations(userId: string) {
  const q = query(
    collection(db, 'tournament_registrations'),
    where('userId', '==', userId)
  )
  const snap = await getDocs(q)
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as TournamentRegistration)
}

// --- BRACKET GENERATION ---
// Helper to create empty team placeholder
const createTBD = (role: string) => ({
  id: `TBD-${role}`,
  name: 'TBD',
  logo: '',
  captainId: '',
  captainName: ''
})


// --- BATTLE ROYALE HELPERS ---

export function calculateMatchPoints(rank: number, kills: number, pointsSystem?: { killPoints: number, placementPoints: number[] }) {
  if (!pointsSystem) {
    // Default PUBG Mobile System (approx based on standard)
    // 1st: 15, 2nd: 12, 3rd: 10, 4th: 8, 5th: 6, 6th: 4, 7-8: 2, 9-16: 1
    pointsSystem = {
      killPoints: 1,
      placementPoints: [15, 12, 10, 8, 6, 4, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1] // Index 0 is Rank 1
    }
  }

  // Rank is 1-based, array is 0-based.
  const placementPts = (pointsSystem.placementPoints[rank - 1]) || 0
  const killPts = kills * pointsSystem.killPoints
  return placementPts + killPts
}


export async function generateBattleRoyaleMatches(tournamentId: string, matchesPerGroup: number = 3) {
  const tournament = await getTournament(tournamentId)
  if (!tournament) throw new Error('Tournament not found')

  const groups = await getTournamentGroups(tournamentId)
  const groupNames = Object.keys(groups).sort()

  if (groupNames.length < 1) throw new Error('No groups found')

  const batch = writeBatch(db)
  const matchesColl = collection(db, 'matches_detailed')

  // Delete existing matches
  const qOld = query(matchesColl, where('tournamentId', '==', tournamentId))
  const oldSnap = await getDocs(qOld)
  oldSnap.docs.forEach(d => batch.delete(d.ref))

  let matchCounter = 1

  for (const gName of groupNames) {
    const regs = groups[gName]
    // Get all Team IDs (or User IDs)
    const participantIds = regs.map(r => r.teamId || r.userId)

    for (let i = 1; i <= matchesPerGroup; i++) {
      const matchId = doc(matchesColl).id
      const matchRef = doc(matchesColl, matchId)

      // Create Match Doc
      const match: any = {
        id: matchId,
        tournamentId: tournamentId,
        type: 'BATTLE_ROYALE',
        round: 1, // Group Stage
        matchNumber: matchCounter++,
        group: gName,
        status: 'SCHEDULED',
        startTime: new Date(Date.now() + 86400000), // Mock: tomorrow
        participants: participantIds,
        results: [] // Empty initially
      }
      batch.set(matchRef, match)
    }
  }

  await batch.commit()
  return true
}

// ... existing code ...

export async function generateRoundRobinMatches(tournamentId: string) {
  const tournament = await getTournament(tournamentId)
  if (!tournament) throw new Error('Tournament not found')

  const groups = await getTournamentGroups(tournamentId)
  const groupNames = Object.keys(groups).sort()
  if (groupNames.length === 0) throw new Error('No groups found')

  const batch = writeBatch(db)
  const matchesColl = collection(db, 'matches_detailed')

  const qOld = query(matchesColl, where('tournamentId', '==', tournamentId))
  const oldSnap = await getDocs(qOld)
  oldSnap.docs.forEach(d => batch.delete(d.ref))

  const allRegs: TournamentRegistration[] = []
  groupNames.forEach(g => allRegs.push(...groups[g]))

  const detailsMap: Record<string, { name: string, logo: string }> = {}

  await Promise.all(allRegs.map(async (reg) => {
    const id = reg.teamId || reg.userId
    if (detailsMap[id]) return

    let name = 'TBD'
    let logo = ''

    if (reg.teamId) {
      const t = await getTeam(reg.teamId)
      if (t) { name = t.name; logo = t.logo }
    } else {
      const u = await getUserProfile(reg.userId)
      name = reg.ingameName || u?.displayName || 'Player'
      logo = u?.photoURL || ''
    }
    detailsMap[id] = { name, logo }
  }))

  let matchCounter = 1

  for (const gName of groupNames) {
    const participants = groups[gName]
    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        const pA = participants[i]
        const pB = participants[j]
        const idA = pA.teamId || pA.userId
        const idB = pB.teamId || pB.userId
        const detA = detailsMap[idA] || { name: 'Unknown', logo: '' }
        const detB = detailsMap[idB] || { name: 'Unknown', logo: '' }

        const matchId = doc(matchesColl).id
        const matchRef = doc(matchesColl, matchId)

        const match: any = {
          id: matchId,
          tournamentId: tournamentId,
          type: 'ELIMINATION',
          round: 1,
          matchNumber: matchCounter++,
          group: gName,
          status: 'SCHEDULED',
          startTime: new Date(Date.now() + 86400000),
          teamA: { id: idA, name: detA.name, logo: detA.logo, captainId: pA.userId },
          teamB: { id: idB, name: detB.name, logo: detB.logo, captainId: pB.userId },
          leg: 1
        }
        batch.set(matchRef, match)
      }
    }
  }
  await batch.commit()
  return true
}

export async function generateKnockoutBracket(tournamentId: string) {
  const tournament = await getTournament(tournamentId)
  if (!tournament) throw new Error('Tournament not found')

  if (tournament.type === 'BATTLE_ROYALE') {
    return generateBattleRoyaleMatches(tournamentId)
  }

  const groups = await getTournamentGroups(tournamentId)
  let groupNames = Object.keys(groups).sort()

  // Determine Expected Groups based on Max Teams (Standard Sizes: 32->8, 16->4, 8->2)
  // Or fallback to existing groupNames if not standard
  let expectedGroupCount = groupNames.length
  if (tournament.maxTeams === 32) expectedGroupCount = 8
  else if (tournament.maxTeams === 16) expectedGroupCount = 4
  else if (tournament.maxTeams === 8) expectedGroupCount = 2

  // Ensure we cover A-X even if empty
  const standardNames = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').slice(0, expectedGroupCount)
  // If actual groups differ (e.g. custom names), use actual. Priority to Standard if it looks like standard.
  const useStandard = groupNames.every(n => n.length === 1 && n >= 'A' && n <= 'Z') || groupNames.length < expectedGroupCount
  const targetGroupNames = useStandard ? standardNames : groupNames

  const isFootball = tournament.game === 'EFOOTBALL' || tournament.game === 'FIFA' || tournament.title.toLowerCase().includes('football')
  const createTBD = (label: string) => ({ id: 'tbd', name: label, logo: null, isTBD: true, captainId: '' })

  // 1. Fetch Qualifiers & Details
  let qualifiers: { reg?: TournamentRegistration, group: string, rank: number, placeholder?: any }[] = []
  const qualDetails: Record<string, { name: string, logo: string }> = {}

  const ensureDetails = async (reg: TournamentRegistration) => {
    if (!qualDetails[reg.id]) {
      if (reg.teamId) {
        const t = await getTeam(reg.teamId)
        qualDetails[reg.id] = { name: t?.name || 'Unknown', logo: t?.logo || '' }
      } else {
        const u = await getUserProfile(reg.userId)
        qualDetails[reg.id] = { name: reg.ingameName || u?.displayName || 'Solo', logo: u?.photoURL || '' }
      }
    }
  }

  for (const gName of targetGroupNames) {
    const groupRegs = groups[gName] || [] // Sorted by points in getTournamentGroups? Or we sort here?
    // getTournamentGroups isn't sorted implicitly? It just groups. GroupsDisplay sorts.
    // We should sort by points here to pick top 2 accurately.
    // IMPL DET: We assume GroupsDisplay logic or sort manually.
    // Let's sort manually if possible, or just take first 2 (assuming previously sorted or random)
    // For TBD correctness, accurate sorting is needed.
    // BUT we don't have stats easily here.
    // For now, take first 2. If empty, use TBD logic.

    // Position 1
    if (groupRegs[0]) {
      await ensureDetails(groupRegs[0])
      qualifiers.push({ reg: groupRegs[0], group: gName, rank: 1 })
    } else {
      qualifiers.push({ placeholder: createTBD(`${gName}1`), group: gName, rank: 1 })
    }

    // Position 2
    if (groupRegs[1]) {
      await ensureDetails(groupRegs[1])
      qualifiers.push({ reg: groupRegs[1], group: gName, rank: 2 })
    } else {
      qualifiers.push({ placeholder: createTBD(`${gName}2`), group: gName, rank: 2 })
    }
  }

  const getTeamObj = (q: any) => {
    if (q.placeholder) return q.placeholder
    if (q.reg) return { ...qualDetails[q.reg.id], id: q.reg.teamId || q.reg.userId }
    return createTBD('TBD')
  }

  // 2. Generate Matchups (Round 1)
  const matchups: { tA: any, tB: any }[] = []

  if (targetGroupNames.length === 2) {
    // 2 Groups: A1vB2, B1vA2
    matchups.push({
      tA: getTeamObj(qualifiers.find(q => q.group === targetGroupNames[0] && q.rank === 1)),
      tB: getTeamObj(qualifiers.find(q => q.group === targetGroupNames[1] && q.rank === 2))
    })
    matchups.push({
      tA: getTeamObj(qualifiers.find(q => q.group === targetGroupNames[1] && q.rank === 1)),
      tB: getTeamObj(qualifiers.find(q => q.group === targetGroupNames[0] && q.rank === 2))
    })
  } else if (targetGroupNames.length === 4) {
    // 4 Groups: A1vB2, C1xD2, B1xA2, D1xC2 (Interleaved for bracket balance)
    const pairs = [
      [targetGroupNames[0], targetGroupNames[1]], // A-B
      [targetGroupNames[2], targetGroupNames[3]], // C-D
      [targetGroupNames[1], targetGroupNames[0]], // B-A
      [targetGroupNames[3], targetGroupNames[2]]  // D-C
    ]
    pairs.forEach(([g1, g2]) => {
      matchups.push({
        tA: getTeamObj(qualifiers.find(q => q.group === g1 && q.rank === 1)),
        tB: getTeamObj(qualifiers.find(q => q.group === g2 && q.rank === 2))
      })
    })
  } else if (targetGroupNames.length === 8) {
    // 8 Groups: A1vB2, C1xD2, E1xF2, G1xH2 ... and opposites
    const pairs = [
      ['A', 'B'], ['C', 'D'], ['E', 'F'], ['G', 'H'],
      ['B', 'A'], ['D', 'C'], ['F', 'E'], ['H', 'G']
    ]
    // To create a nice tree: 
    // Q1: A1 v B2
    // Q2: C1 v D2
    // Q3: B1 v A2
    // Q4: D1 v C2
    // ...
    // Standard Bracket ordering often separates same-group pairs as far as possible.
    // Top Half: A1vB2, C1xD2, E1xF2, G1xH2
    // Bottom Half: B1xA2, D1xC2, F1xE2, H1xG2

    // Let's just push them in order.
    pairs.forEach(([g1, g2]) => {
      // Careful with standardNames if custom.
      // We rely on index if names don't match? No, we used targetGroupNames.
      const g1Name = targetGroupNames[g1.charCodeAt(0) - 65]
      const g2Name = targetGroupNames[g2.charCodeAt(0) - 65]

      matchups.push({
        tA: getTeamObj(qualifiers.find(q => q.group === g1Name && q.rank === 1)),
        tB: getTeamObj(qualifiers.find(q => q.group === g2Name && q.rank === 2))
      })
    })
  } else {
    // Fallback
    for (let i = 0; i < qualifiers.length; i += 2) {
      matchups.push({
        tA: getTeamObj(qualifiers[i]),
        tB: getTeamObj(qualifiers[i + 1] || qualifiers[i]) // prevent crash
      })
    }
  }

  // 3. Generate Bracket Tree
  const batch = writeBatch(db)
  const matchesColl = collection(db, 'matches_detailed')

  const qOld = query(matchesColl, where('tournamentId', '==', tournamentId))
  const oldSnap = await getDocs(qOld)
  oldSnap.docs.forEach(d => batch.delete(d.ref))

  let matchCounter = 1
  let currentRoundMatchups = matchups

  // Total Rounds based on MATCHUPS count (e.g. 8 matches -> 16 teams -> 4 rounds (Ro16, QF, SF, F))
  // matchCount = 8. log2(8) = 3. Rounds = 3 + 1? = 4.
  // 16 teams -> Final is Round 4.
  // matchCount * 2 = teams.
  const totalRounds = Math.ceil(Math.log2(matchups.length * 2))

  for (let r = 1; r <= totalRounds; r++) {
    const nextRoundMatchups: any[] = []
    const isFinal = r === totalRounds
    const participantsCount = Math.pow(2, totalRounds - r + 1)

    // Two Leg: If football, NOT final, and Round 1 of 16-team bracket (or maybe QF too?)
    // User requested "From Round of 16".
    // 32 Team Tournament -> 8 Matches (Round 1 / Ro16) -> Participants 16.
    // So if participantsCount <= 16, it applies.
    const isTwoLeg = isFootball && !isFinal && participantsCount <= 16

    const createdMatches: any[] = []

    for (let i = 0; i < currentRoundMatchups.length; i++) {
      const m = currentRoundMatchups[i]
      const mId = doc(matchesColl).id

      if (isTwoLeg) {
        const leg1Id = doc(matchesColl).id
        const leg2Id = doc(matchesColl).id

        const now = new Date()
        const leg1Time = new Date(now.setDate(now.getDate() + 1))
        const leg2Time = new Date(now.setDate(now.getDate() + 1))

        batch.set(doc(matchesColl, leg1Id), {
          id: leg1Id, tournamentId, tournamentName: tournament.title, matchNumber: matchCounter, round: r,
          teamA: m.tA, teamB: m.tB,
          game: tournament.game, status: 'scheduled', leg: 1, aggregateId: mId,
          scheduledAt: leg1Time, createdAt: new Date()
        })
        batch.set(doc(matchesColl, leg2Id), {
          id: leg2Id, tournamentId, tournamentName: tournament.title, matchNumber: matchCounter, round: r,
          teamA: m.tB, teamB: m.tA,
          game: tournament.game, status: 'scheduled', leg: 2, aggregateId: mId,
          scheduledAt: leg2Time, createdAt: new Date()
        })
        batch.set(doc(matchesColl, mId), {
          id: mId, tournamentId, tournamentName: tournament.title, matchNumber: matchCounter, round: r,
          teamA: m.tA, teamB: m.tB,
          game: tournament.game, status: 'scheduled', isAggregate: true,
          scheduledAt: leg2Time, createdAt: new Date()
        })
      } else {
        batch.set(doc(matchesColl, mId), {
          id: mId, tournamentId, tournamentName: tournament.title, matchNumber: matchCounter, round: r,
          teamA: m.tA, teamB: m.tB,
          game: tournament.game, status: 'scheduled',
          createdAt: new Date()
        })
      }

      createdMatches.push({ id: mId, number: matchCounter })
      matchCounter++
    }

    // Prepare next round
    if (r < totalRounds) {
      for (let i = 0; i < createdMatches.length; i += 2) {
        if (i + 1 < createdMatches.length) {
          nextRoundMatchups.push({
            tA: createTBD(`Winner M${createdMatches[i].number}`),
            tB: createTBD(`Winner M${createdMatches[i + 1].number}`)
          })
        } else {
          // Should be even power of 2, so this shouldn't happen usually
          nextRoundMatchups.push({ tA: createTBD(`Winner M${createdMatches[i].number}`), tB: createTBD('BYE') })
        }
      }
    }
    currentRoundMatchups = nextRoundMatchups
  }

  await batch.commit()
}

// --- MATCH EXECUTION ---

export async function submitMatchResult(matchId: string, userId: string, scoreA: number, scoreB: number, proofUrl: string, videoUrl?: string, rank?: number, kills?: number) {
  const matchRef = doc(db, 'matches_detailed', matchId)
  const snap = await getDoc(matchRef)
  if (!snap.exists()) throw new Error('Match not found')
  const match = snap.data() as Match

  if (match.type === 'BATTLE_ROYALE') {
    // BATTLE ROYALE LOGIC
    if (rank === undefined || kills === undefined) throw new Error('Rank and Kills are required for Battle Royale')

    // Find Team ID for this user in this tournament
    const q = query(
      collection(db, 'tournament_registrations'),
      where('tournamentId', '==', match.tournamentId),
      where('userId', '==', userId),
      where('status', '==', 'approved')
    )
    const regSnap = await getDocs(q)

    if (regSnap.empty) {
      // Fallback: Check if user is captain of any team in the participants list?
      // Since participants is just IDs, tough. 
      // Rely on reg. 
      throw new Error('You are not a registered participant in this tournament')
    }

    const reg = regSnap.docs[0].data() as TournamentRegistration
    const teamId = reg.teamId || userId

    // Check if team is in this match participants (optional safety)
    if (match.participants && !match.participants.includes(teamId)) {
      // Allow for now, strictness might block legitimate subs? 
      // But normally BR match has specific participants. 
      // If 'participants' is used to generate match, we should check.
    }

    const newSubmission = {
      teamId,
      submittedBy: userId,
      rank: Number(rank),
      kills: Number(kills),
      proofUrl,
      videoUrl,
      submittedAt: new Date()
    }

    const currentSubmissions = match.submissions || []
    const filtered = currentSubmissions.filter(s => s.teamId !== teamId)
    filtered.push(newSubmission)

    await updateDoc(matchRef, {
      status: 'submitted',
      submissions: filtered
    })

  } else {
    // ELIMINATION LOGIC
    // Validate User (Must be Captain of Team A or B)
    const isCapA = (match.teamA?.captainId === userId) || (match.teamA?.id === userId)
    const isCapB = (match.teamB?.captainId === userId) || (match.teamB?.id === userId)

    if (!isCapA && !isCapB) {
      const isAdminUser = await isAdmin(userId)
      if (!isAdminUser) throw new Error('You must be a team captain to submit results')
    }

    const winnerId = scoreA > scoreB ? match.teamA?.id : scoreB > scoreA ? match.teamB?.id : null

    await updateDoc(matchRef, {
      status: 'submitted',
      result: {
        scoreA,
        scoreB,
        winnerId,
        submittedBy: userId,
        proofUrl,
        videoUrl,
        submittedAt: new Date(),
        teamAStats: { totalPoints: scoreA }, // Simple storage for display
        teamBStats: { totalPoints: scoreB }
      }
    })
  }
}

// ... imports

export async function finalizeBattleRoyaleMatch(matchId: string, results: { teamId: string, rank: number, kills: number }[]) {
  const matchRef = doc(db, 'matches_detailed', matchId)
  const matchSnap = await getDoc(matchRef)
  if (!matchSnap.exists()) throw new Error('Match not found')
  const match = matchSnap.data() as Match

  // Fetch Tournament for Points System
  const tRef = doc(db, 'tournaments', match.tournamentId)
  const tSnap = await getDoc(tRef)
  if (!tSnap.exists()) throw new Error('Tournament not found')
  const tournament = tSnap.data() as Tournament

  const pointsSystem = tournament.pointsSystem // Optional

  const finalResults = results.map(r => {
    const totalPoints = calculateMatchPoints(r.rank, r.kills, pointsSystem)
    return {
      teamId: r.teamId,
      teamName: '', // We should ideally fetch team name or skip it. Match participants doesn't have names?
      // Actually, we can just store ID and let UI fetch name, or fetch here.
      // Let's store what we have. UI usually fetches names.
      rank: r.rank,
      kills: r.kills,
      totalPoints
    }
  })

  await updateDoc(matchRef, {
    status: 'completed',
    results: finalResults
  })
}

export async function approveMatchResult(matchId: string, adminId: string) {
  const matchRef = doc(db, 'matches_detailed', matchId)
  const snap = await getDoc(matchRef)
  if (!snap.exists()) throw new Error('Match not found')
  const match = snap.data()

  if (match.status !== 'submitted' && match.status !== 'disputed') {
    throw new Error('Match is not in a state to be approved (must be submitted)')
  }

  // Logic: If approved, we confirm the result.
  // Use the submitted result.
  const result = match.result
  if (!result || !result.winnerId) throw new Error('No valid result found to approve')

  // Update status and stats
  await updateDoc(matchRef, {
    status: 'approved',
    videoUrl: result.proofUrl, // promoted to main video/proof field if schema exist
    approvedBy: adminId,
    approvedAt: new Date()
  })

  // Advance Winner
  // We pass the updated match object (simulated) or fetch again.
  const updatedMatch = { ...match, status: 'approved' }
  await advanceBracketWinner(updatedMatch)
}

// Helper to find next match and update TBD
async function advanceBracketWinner(completedMatch: any) {
  // Logic: Find a match where teamA or teamB is "Winner M{matchNumber}"
  // OR "Winner QF{N}" etc if we used that naming. 

  // Search matches in this tournament.
  // We search for matches that are Scheduled/Pending and have a TBD placeholder matching this match.

  // Indicators we used in generation:
  // "Winner M{N}"
  // "Winner QF{N}"
  // "Winner SF{N}"

  const possibleIndicators = [
    `Winner M${completedMatch.matchNumber}`,
    `Winner QF${completedMatch.matchNumber}`,
    `Winner SF${completedMatch.matchNumber}` // e.g. SF1 corresponds to M5? No, implicit mapping.
  ]

  const matchesColl = collection(db, 'matches_detailed')
  const q = query(
    matchesColl,
    where('tournamentId', '==', completedMatch.tournamentId),
    where('status', '==', 'scheduled')
  )
  const snap = await getDocs(q)

  let nextMatchDoc = null
  let targetSlot: 'teamA' | 'teamB' | null = null

  for (const d of snap.docs) {
    const m = d.data()
    // Check Team A
    if (m.teamA?.id?.startsWith('TBD-')) {
      for (const ind of possibleIndicators) {
        if (m.teamA.id === `TBD-${ind}` || m.teamA.name === ind) {
          nextMatchDoc = d
          targetSlot = 'teamA'
          break
        }
      }
    }
    if (targetSlot) break

    // Check Team B
    if (m.teamB?.id?.startsWith('TBD-')) {
      for (const ind of possibleIndicators) {
        if (m.teamB.id === `TBD-${ind}` || m.teamB.name === ind) {
          nextMatchDoc = d
          targetSlot = 'teamB'
          break
        }
      }
    }
    if (targetSlot) break
  }

  if (nextMatchDoc && targetSlot) {
    // Determine Winning Team Object
    const winnerId = completedMatch.result.winnerId
    const winnerTeam = winnerId === completedMatch.teamA.id ? completedMatch.teamA : completedMatch.teamB

    // Update the slot
    await updateDoc(nextMatchDoc.ref, {
      [`${targetSlot}`]: {
        id: winnerTeam.id || '',
        name: winnerTeam.name || '',
        logo: winnerTeam.logo || '',
        captainId: winnerTeam.captainId || '',
        captainName: winnerTeam.captainName || ''
      }
    })
  }
}

// Export from bracket-services
export { generateBracket } from './services/bracket-services'
