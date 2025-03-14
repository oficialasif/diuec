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