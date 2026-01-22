export interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL: string
  role: 'user' | 'admin'
  createdAt: Date
  lastLogin: Date
}

export interface Post {
  id: string
  userId: string
  userDisplayName: string
  userPhotoURL: string
  imageUrl: string
  caption: string
  likes: string[] // Array of user IDs who liked the post
  likesCount: number
  comments: Comment[]
  createdAt: Date
}

export interface Comment {
  id: string
  userId: string
  userDisplayName: string
  userPhotoURL: string
  content: string
  createdAt: Date
}

export interface Statistics {
  totalVisitors: number
  activeUsers: number
  totalTournaments: number
  lastUpdated: Date
}

export interface TeamMember {
  userId: string
  displayName: string
  photoURL: string
  role: 'captain' | 'member' | 'sub'
  joinedAt: Date
}

export interface Team {
  id: string
  name: string
  tag: string // e.g. [SKT]
  logo: string
  description: string
  game: 'VALORANT' | 'CS2' | 'PUBGM' | 'FIFA' | 'OTHER'
  captainId: string
  members: TeamMember[]
  memberIds: string[] // For efficient querying
  invites: string[] // Array of user emails or IDs invited
  stats: {
    wins: number
    losses: number
    matchesPlayed: number
  }
  createdAt: Date
  updatedAt: Date
}

export interface Tournament {
  id: string
  title: string
  game: string // 'VALORANT' | 'CS2' | 'PUBGM' | 'EFOOTBALL' | 'OTHER'
  format: 'SOLO' | 'DUO' | 'TRIO' | 'SQUAD'
  type: 'ELIMINATION' | 'BATTLE_ROYALE' | 'GROUP_KNOCKOUT'
  description: string
  prizePool: string
  entryFee?: string

  maxTeams: number
  registeredTeams: number
  teamSize: number // Driven by format usually, but good to store. e.g. Squad=4 or 5?

  registrationStart: Date
  registrationEnd: Date
  startDate: Date
  endDate: Date

  status: 'upcoming' | 'ongoing' | 'completed'
  image: string
  rules: string[]

  // Links
  facebookLink?: string
  discordLink?: string
  chatGroupLink?: string
  rulebookLink?: string

  // For Battle Royale
  pointsSystem?: {
    killPoints: number
    placementPoints: number[] // Index 0 = 1st place, Index 1 = 2nd...
  }
  winner?: {
    id: string
    name: string
    logo: string
  }
}

export interface Match {
  id: string
  tournamentId: string
  type: 'ELIMINATION' | 'BATTLE_ROYALE'
  round: number // 1 = Ro16, 2 = QF, etc.
  matchNumber: number // 1 to N
  group?: string // For Group Stage Matches (A, B, C...)
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'DISPUTE'

  // ELIMINATION (1v1)
  teamA?: {
    id: string
    name: string
    logo: string
    captainId?: string
  }
  teamB?: {
    id: string
    name: string
    logo: string
    captainId?: string
  }

  // Legacy fields (optional)
  teamAId?: string
  teamAName?: string
  teamALogo?: string
  teamBId?: string
  teamBName?: string
  teamBLogo?: string

  scoreA?: number
  scoreB?: number
  winnerId?: string

  // BATTLE ROYALE (Lobby)
  participants?: string[] // Team IDs
  results?: {
    teamId: string
    teamName: string
    kills: number
    rank: number
    totalPoints: number
  }[]

  startTime: Date
  proofImage?: string

  // Submissions (Battle Royale)
  submissions?: {
    teamId: string
    submittedBy: string
    rank?: number
    kills?: number
    proofUrl: string
    videoUrl?: string
    submittedAt: Date
  }[]

  // eFootball Two-Leg Fields
  leg?: 1 | 2
  aggregateId?: string
  isAggregate?: boolean
}

export interface TournamentRegistration {
  id: string
  tournamentId: string
  teamId: string | null // Null for SOLO if registering as individual
  userId: string // Captain or Individual
  ingameName?: string // Custom name for Solo tournaments
  status: 'pending' | 'approved' | 'rejected'
  group?: string
  paymentDetails?: {
    transactionId: string
    paymentNumber: string
    captainEmail?: string
    submissionDate: Date // Changed from string to Date for better querying
  }
  createdAt: Date
}

export interface TeamInvite {
  id: string
  teamId: string
  teamName?: string
  invitedEmail: string
  invitedUserId?: string // Can be null if inviting non-registered user
  inviterId: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: Date
}


export interface JoinRequest {
  id: string
  teamId: string
  teamName?: string
  userId: string
  userDisplayName: string
  userPhotoURL: string

  // Additional player information
  name: string
  gmail: string
  gameUsername: string
  deviceName: string // Mobile, PC, Console details
  playingLevel: 'beginner' | 'intermediate' | 'advanced' | 'pro'
  experience: string // Years of experience or description
  gameName: string // Specific game for the team

  status: 'pending' | 'accepted' | 'rejected'
  createdAt: Date
}

export interface CommitteeMember {
  id: string
  name: string
  role: string
  image: string
  order: number
  createdAt: Date
}

export interface GalleryImage {
  id: string
  title: string
  imageUrl: string
  width?: number
  height?: number
  createdAt: Date
}

export interface Sponsor {
  id: string
  name: string
  logo: string
  website?: string
  createdAt: Date
} 