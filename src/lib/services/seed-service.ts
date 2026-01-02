
import { db } from '@/lib/firebase'
import { collection, addDoc, Timestamp, doc, setDoc, query, where, getDocs, deleteDoc, writeBatch } from 'firebase/firestore'

export const seedTestData = async (currentUserId: string, currentUserDisplayName: string) => {
    try {
        console.log('Seeding test data...')

        // 1. Create Tournament
        const tournamentData = {
            title: 'Free Fire Championship (Test)',
            game: 'FREE FIRE',
            format: 'SQUAD',
            type: 'ELIMINATION',
            description: 'Test tournament for verifying bracket logic',
            prizePool: '10000 BDT',
            entryFee: 'Free',
            maxTeams: 8,
            registeredTeams: 8,
            teamSize: 4,
            registrationStart: Timestamp.now(),
            registrationEnd: Timestamp.now(),
            startDate: Timestamp.fromDate(new Date(Date.now() + 86400000)),
            status: 'ongoing',
            image: '',
            createdAt: Timestamp.now()
        }

        const tournamentRef = await addDoc(collection(db, 'tournaments'), tournamentData)
        const tournamentId = tournamentRef.id
        console.log('Created Tournament:', tournamentId)

        // 2. Create Teams & Registrations
        for (let i = 0; i < 8; i++) {
            const isMyTeam = i === 0;
            const teamId = doc(collection(db, 'teams')).id
            const captainId = isMyTeam ? currentUserId : `test_user_${i}`
            const captainName = isMyTeam ? currentUserDisplayName : `Test Captain ${i}`

            const teamData = {
                id: teamId,
                name: isMyTeam ? `My Test Team (Gods)` : `Test Team Delta ${i}`,
                tag: isMyTeam ? `GOD` : `T${i}`,
                logo: '',
                description: 'Test Team',
                game: 'FREE FIRE',
                captainId: captainId,
                members: [
                    { userId: captainId, displayName: captainName, role: 'captain', joinedAt: new Date() },
                    { userId: `mem1_${i}`, displayName: `Member 1`, role: 'member', joinedAt: new Date() },
                    { userId: `mem2_${i}`, displayName: `Member 2`, role: 'member', joinedAt: new Date() },
                    { userId: `mem3_${i}`, displayName: `Member 3`, role: 'member', joinedAt: new Date() }
                ],
                stats: { wins: 0, losses: 0, matchesPlayed: 0 },
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            }

            await setDoc(doc(db, 'teams', teamId), teamData)

            // Register
            await addDoc(collection(db, 'tournament_registrations'), {
                tournamentId,
                teamId,
                userId: captainId,
                status: 'approved',
                createdAt: Timestamp.now()
            })
        }

        return { success: true, message: 'Seeded 1 Tournament and 8 Teams' }

    } catch (error) {
        console.error('Error seeding data:', error)
        throw error
    }
}

export const cleanupTestData = async () => {
    try {
        console.log('Cleaning up test data...')
        const batch = writeBatch(db)

        // 1. Delete Test Tournament
        const tourQuery = query(collection(db, 'tournaments'), where('title', '==', 'Free Fire Championship (Test)'))
        const tourSnap = await getDocs(tourQuery)

        const tournamentIds: string[] = []
        tourSnap.forEach(doc => {
            tournamentIds.push(doc.id)
            batch.delete(doc.ref)
        })

        // 2. Delete Test Teams
        // Delete 'My Test Team (Gods)'
        const myTeamQuery = query(collection(db, 'teams'), where('name', '==', 'My Test Team (Gods)'))
        const myTeamSnap = await getDocs(myTeamQuery)
        myTeamSnap.forEach(doc => batch.delete(doc.ref))

        // Delete 'Test Team Delta X'
        // We can't do a "startsWith" query easily in Firestore without proper index logic (str >= prefix and str < prefix + end)
        // Or we just fetch all teams and filter in memory since it's cleanup script.
        // Assuming we inserted 7 other teams.
        // Let's use the predictable names loop? No, IDs are random.
        // Let's query by tag "T0"..."T7" or name?
        // Simpler: Fetch all teams where game == 'FREE FIRE' and description == 'Test Team'
        const testTeamsQuery = query(
            collection(db, 'teams'),
            where('description', '==', 'Test Team'),
            where('game', '==', 'FREE FIRE')
        )
        const testTeamsSnap = await getDocs(testTeamsQuery)
        testTeamsSnap.forEach(doc => batch.delete(doc.ref))

        // 3. Delete Registrations & Matches & Matches Detailed
        for (const tid of tournamentIds) {
            // Registrations
            const regQuery = query(collection(db, 'tournament_registrations'), where('tournamentId', '==', tid))
            const regSnap = await getDocs(regQuery)
            regSnap.forEach(doc => batch.delete(doc.ref))

            // Matches (Old collection if any)
            const matchQuery = query(collection(db, 'matches'), where('tournamentId', '==', tid))
            const matchSnap = await getDocs(matchQuery)
            matchSnap.forEach(doc => batch.delete(doc.ref))

            // Matches Detailed
            const matchDetQuery = query(collection(db, 'matches_detailed'), where('tournamentId', '==', tid))
            const matchDetSnap = await getDocs(matchDetQuery)
            matchDetSnap.forEach(doc => batch.delete(doc.ref))
        }

        await batch.commit()
        return { success: true, message: 'Cleanup complete' }

    } catch (error) {
        console.error('Error cleaning up data:', error)
        throw error
    }
}
