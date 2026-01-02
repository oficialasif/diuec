import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    doc,
    orderBy,
    limit,
    Timestamp,
    onSnapshot,
    getDoc
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface Conversation {
    id: string
    type: 'support' | 'community' | 'team' | 'direct'
    participants: string[] // User IDs
    channelId: string
    lastMessage: string
    lastMessageAt: Date
    createdAt: Date
    metadata?: {
        teamId?: string
        teamName?: string
        supportUserId?: string // The user being helped in support
        userName?: string // User's display name
        userAvatar?: string // User's avatar URL
        isResolved?: boolean
    }
}

export interface ConversationMessage {
    id: string
    conversationId: string
    channelId: string
    userId: string
    userName: string
    userAvatar: string
    text: string
    createdAt: Date
    isAdmin?: boolean
}

/**
 * Create a new conversation
 */
export async function createConversation(
    type: Conversation['type'],
    channelId: string,
    participants: string[],
    metadata?: Conversation['metadata']
): Promise<string> {
    const conversationData = {
        type,
        channelId,
        participants,
        lastMessage: '',
        lastMessageAt: Timestamp.now(),
        createdAt: Timestamp.now(),
        metadata: metadata || {}
    }

    const docRef = await addDoc(collection(db, 'conversations'), conversationData)
    return docRef.id
}

/**
 * Find or create a support conversation for a user
 */
export async function findOrCreateSupportConversation(userId: string, userName: string, userAvatar?: string): Promise<string> {
    // Check if user already has a support conversation
    const q = query(
        collection(db, 'conversations'),
        where('type', '==', 'support'),
        where('metadata.supportUserId', '==', userId),
        where('metadata.isResolved', '==', false),
        limit(1)
    )

    const snapshot = await getDocs(q)

    if (!snapshot.empty) {
        // Update the conversation with latest user info
        const conversationId = snapshot.docs[0].id
        const conversationRef = doc(db, 'conversations', conversationId)
        await updateDoc(conversationRef, {
            'metadata.userName': userName,
            'metadata.userAvatar': userAvatar || ''
        })
        return conversationId
    }

    // Create new support conversation with user info
    return createConversation('support', 'support', [userId], {
        supportUserId: userId,
        userName: userName,
        userAvatar: userAvatar || '',
        isResolved: false
    })
}

/**
 * Get conversation by ID
 */
export async function getConversationById(conversationId: string): Promise<Conversation | null> {
    const docRef = doc(db, 'conversations', conversationId)
    const snapshot = await getDoc(docRef)

    if (!snapshot.exists()) return null

    const data = snapshot.data()
    return {
        id: snapshot.id,
        type: data.type,
        participants: data.participants,
        channelId: data.channelId,
        lastMessage: data.lastMessage,
        lastMessageAt: data.lastMessageAt?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        metadata: data.metadata
    }
}

/**
 * Get all support conversations (for admin)
 */
export async function getSupportConversations(): Promise<Conversation[]> {
    const q = query(
        collection(db, 'conversations'),
        where('type', '==', 'support'),
        orderBy('lastMessageAt', 'desc')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => {
        const data = doc.data()
        return {
            id: doc.id,
            type: data.type,
            participants: data.participants,
            channelId: data.channelId,
            lastMessage: data.lastMessage,
            lastMessageAt: data.lastMessageAt?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            metadata: data.metadata
        }
    })
}

/**
 * Add a message to a conversation
 */
export async function addMessageToConversation(
    conversationId: string,
    userId: string,
    userName: string,
    userAvatar: string,
    text: string,
    channelId: string,
    isAdmin: boolean = false
): Promise<string> {
    // Add message
    const messageData = {
        conversationId,
        channelId,
        userId,
        userName,
        userAvatar,
        text,
        createdAt: Timestamp.now(),
        isAdmin
    }

    const messageRef = await addDoc(collection(db, 'chat_messages'), messageData)

    // Update conversation's last message
    const conversationRef = doc(db, 'conversations', conversationId)
    await updateDoc(conversationRef, {
        lastMessage: text,
        lastMessageAt: Timestamp.now()
    })

    return messageRef.id
}

/**
 * Get messages for a conversation
 */
export function subscribeToConversationMessages(
    conversationId: string,
    callback: (messages: ConversationMessage[]) => void
) {
    console.log('Setting up message listener for conversation:', conversationId)

    // Remove orderBy to avoid Firestore index requirement - we'll sort client-side
    const q = query(
        collection(db, 'chat_messages'),
        where('conversationId', '==', conversationId),
        limit(100)
    )

    return onSnapshot(q, (snapshot) => {
        const timestamp = new Date().toISOString()
        console.log(`[${timestamp}] Snapshot update - ${snapshot.docs.length} messages for conversation ${conversationId}`)

        const messages = snapshot.docs.map(doc => {
            const data = doc.data()
            const msg = {
                id: doc.id,
                conversationId: data.conversationId,
                channelId: data.channelId,
                userId: data.userId,
                userName: data.userName,
                userAvatar: data.userAvatar,
                text: data.text,
                createdAt: data.createdAt?.toDate() || new Date(),
                isAdmin: data.isAdmin || false
            }
            console.log(`  - Message: ${msg.text.substring(0, 30)}... (${msg.createdAt.toLocaleTimeString()})`)
            return msg
        })

        // Sort by timestamp ascending (client-side)
        messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

        console.log(`[${timestamp}] Sorted ${messages.length} messages, calling callback`)
        callback(messages)
    }, (error) => {
        console.error('Error in message subscription:', error)
    })
}

/**
 * Subscribe to support conversations (for admin)
 */
export function subscribeToSupportConversations(
    callback: (conversations: Conversation[]) => void
) {
    const q = query(
        collection(db, 'conversations'),
        where('type', '==', 'support')
    )

    return onSnapshot(q, (snapshot) => {
        const conversations = snapshot.docs.map(doc => {
            const data = doc.data()
            return {
                id: doc.id,
                type: data.type,
                participants: data.participants,
                channelId: data.channelId,
                lastMessage: data.lastMessage,
                lastMessageAt: data.lastMessageAt?.toDate() || new Date(),
                createdAt: data.createdAt?.toDate() || new Date(),
                metadata: data.metadata
            }
        })

        // Sort by last message time
        conversations.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime())

        callback(conversations)
    })
}

/**
 * Mark support conversation as resolved
 */
export async function resolveConversation(conversationId: string) {
    const conversationRef = doc(db, 'conversations', conversationId)
    await updateDoc(conversationRef, {
        'metadata.isResolved': true
    })
}

/**
 * Find or create community conversation
 * Community is a single global conversation for all users
 */
export async function findOrCreateCommunityConversation(): Promise<string> {
    // Check if community conversation exists
    const q = query(
        collection(db, 'conversations'),
        where('type', '==', 'community'),
        where('channelId', '==', 'community'),
        limit(1)
    )

    const snapshot = await getDocs(q)

    if (!snapshot.empty) {
        return snapshot.docs[0].id
    }

    // Create community conversation
    return createConversation('community', 'community', [])
}

/**
 * Find or create team conversation
 * Each team has its own conversation
 */
export async function findOrCreateTeamConversation(teamId: string, teamName: string): Promise<string> {
    const channelId = `team-${teamId}`

    // Check if team conversation exists
    const q = query(
        collection(db, 'conversations'),
        where('type', '==', 'team'),
        where('channelId', '==', channelId),
        limit(1)
    )

    const snapshot = await getDocs(q)

    if (!snapshot.empty) {
        return snapshot.docs[0].id
    }

    // Create team conversation
    return createConversation('team', channelId, [], {
        teamId,
        teamName
    })
}

/**
 * Get user's conversations (for chat sidebar)
 */
export async function getUserConversations(userId: string): Promise<Conversation[]> {
    // Get conversations where user is a participant or support conversations for this user
    const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', userId)
    )

    const snapshot = await getDocs(q)

    const conversations: Conversation[] = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
            id: doc.id,
            type: data.type,
            participants: data.participants,
            channelId: data.channelId,
            lastMessage: data.lastMessage,
            lastMessageAt: data.lastMessageAt?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            metadata: data.metadata
        }
    })

    // Also get user's support conversation
    const supportQ = query(
        collection(db, 'conversations'),
        where('type', '==', 'support'),
        where('metadata.supportUserId', '==', userId),
        where('metadata.isResolved', '==', false),
        limit(1)
    )

    const supportSnapshot = await getDocs(supportQ)
    if (!supportSnapshot.empty) {
        const doc = supportSnapshot.docs[0]
        const data = doc.data()
        conversations.push({
            id: doc.id,
            type: data.type,
            participants: data.participants,
            channelId: data.channelId,
            lastMessage: data.lastMessage,
            lastMessageAt: data.lastMessageAt?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            metadata: data.metadata
        })
    }

    // Sort by last message time
    conversations.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime())

    return conversations
}
