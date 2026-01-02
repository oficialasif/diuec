
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, doc, writeBatch, Timestamp, getDoc } from 'firebase/firestore'
import { Tournament, Match, TournamentRegistration } from '@/lib/models'

export const generateBracket = async (tournamentId: string) => {
    console.log('generateBracket called for:', tournamentId);
    try {
        if (!tournamentId || typeof tournamentId !== 'string') {
            throw new Error('Invalid tournamentId provided');
        }

        const tournamentRef = doc(db, 'tournaments', tournamentId);
        const tourDoc = await getDoc(tournamentRef);

        if (!tourDoc.exists()) {
            throw new Error('Tournament not found');
        }

        const tournamentData = tourDoc.data() as Tournament;
        console.log('Tournament found:', tournamentData.title);

        // 2. Fetch Approved Registrations
        console.log('Fetching registrations...');
        // Fetch all for tournament then filter in memory to avoid needing a composite index
        const regQuery = query(
            collection(db, 'tournament_registrations'),
            where('tournamentId', '==', tournamentId)
        );
        const regSnap = await getDocs(regQuery);
        console.log('Registrations found raw:', regSnap.size);

        let participants = regSnap.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter((p: any) => p.status === 'approved') as TournamentRegistration[];

        console.log('Approved participants:', participants.length);

        if (participants.length < 2) {
            throw new Error(`Not enough teams to generate a bracket (Found ${participants.length})`);
        }

        // 3. Shuffle Participants
        participants = participants.sort(() => Math.random() - 0.5);

        // 4. Calculate Rounds
        const totalTeams = participants.length;
        let bracketSize = 2;
        while (bracketSize < totalTeams) {
            bracketSize *= 2;
        }
        console.log('Bracket size:', bracketSize);

        const batch = writeBatch(db);
        const matchesCollection = collection(db, 'matches_detailed');

        const round1MatchesCount = bracketSize / 2;

        // Pre-fetch team details
        const teamCache: Record<string, any> = {};
        console.log('Fetching team details...');
        await Promise.all(participants.map(async (p) => {
            try {
                if (p.teamId && !teamCache[p.teamId]) {
                    const tDoc = await getDoc(doc(db, 'teams', p.teamId));
                    if (tDoc.exists()) teamCache[p.teamId] = tDoc.data();
                }
            } catch (err) {
                console.warn('Error fetching team:', p.teamId, err);
            }
        }));

        const batches: any[] = [];
        let currentRound = 1;
        let currentRoundMatches = round1MatchesCount;
        let roundParticipants = participants;

        // Start recursion or loop for all rounds
        // Logic: 
        // Round 1: N/2 matches. Populated with actual teams.
        // Round 2: N/4 matches. Empty TBD.
        // ...
        // Round X: 1 match. Empty TBD.

        // We need to loop from Round 1 up to Final
        // round1MatchesCount is starting number of matches. e.g. 4 for 8 teams.
        // Round 1 (4 matches) -> Round 2 (2 matches) -> Round 3 (1 match)

        let matchesToCreateCount = round1MatchesCount;

        while (matchesToCreateCount >= 1) {
            console.log(`Generating Round ${currentRound} with ${matchesToCreateCount} matches`);

            for (let i = 0; i < matchesToCreateCount; i++) {
                const matchId = doc(matchesCollection).id;
                const matchRef = doc(matchesCollection, matchId);

                const matchData: any = {
                    id: matchId,
                    tournamentId,
                    tournamentName: tournamentData.title || 'Tournament',
                    game: tournamentData.game || 'FREE FIRE',
                    type: 'ELIMINATION',
                    round: currentRound,
                    matchNumber: i + 1, // Reset per round? Or global? 
                    // Visualizer sorts by matchNumber generally or per-round. 
                    // Let's keep 1-N index per round for simplicity in UI logic if we group by round. 
                    // But if we want unique numbering across tournament, we need a global counter.
                    // For now, per-round index is fine as UI groups by round.
                    status: 'scheduled',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    teamA: { id: 'TBD', name: 'TBD', logo: '' },
                    teamB: { id: 'TBD', name: 'TBD', logo: '' },
                    result: null,
                    createdBy: 'system'
                };

                // Populate Round 1 Only
                if (currentRound === 1) {
                    const teamA = roundParticipants[i * 2];
                    const teamB = roundParticipants[i * 2 + 1];

                    if (teamA) {
                        const tId = teamA.teamId || teamA.userId;
                        const tData = teamCache[tId] || {};
                        console.log(`R1 Match ${i + 1} Team A:`, tId, tData.name);
                        matchData.teamA = {
                            id: tId,
                            name: tData.name || 'Unknown Team',
                            logo: tData.logo || '',
                            captainId: tData.captainId || tId
                        };
                    }

                    if (teamB) {
                        const tId = teamB.teamId || teamB.userId;
                        const tData = teamCache[tId] || {};
                        console.log(`R1 Match ${i + 1} Team B:`, tId, tData.name);
                        matchData.teamB = {
                            id: tId,
                            name: tData.name || 'Unknown Team',
                            logo: tData.logo || '',
                            captainId: tData.captainId || tId
                        };
                    } else {
                        // BYE
                        matchData.status = 'completed'; // Auto win? 
                        // Actually if it's a BYE, we should probably auto-advance them to next round?
                        // For MVP, marking as completed/bye is fine.
                        // Ideally we would insert them into next round's slot immediately.
                        // But let's stick to simple generation.
                        matchData.result = { winner: 'teamA' };
                        matchData.note = 'Bye';
                        matchData.teamB = { id: 'BYE', name: 'BYE', logo: '' };
                    }
                }

                batch.set(matchRef, matchData);
            }

            matchesToCreateCount /= 2;
            currentRound++;
        }

        // 6. Update Tournament Status
        console.log('Committing batch...');
        batch.update(tournamentRef, { status: 'ongoing', registrationEnd: Timestamp.now() });

        await batch.commit();
        console.log('Bracket generated successfully.');
        return { success: true, message: `Generated ${round1MatchesCount} matches` };

    } catch (error) {
        console.error('Error generating bracket inside service:', error);
        throw error;
    }
}
