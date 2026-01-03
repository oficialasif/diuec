import { db } from '@/lib/firebase'
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    query,
    where,
    writeBatch,
    orderBy,
    updateDoc
} from 'firebase/firestore'
import { Tournament, TournamentRegistration } from '@/lib/models'
import { MatchDetailed, GameType } from '@/lib/models/match-stats'

// Generate Bracket for a Tournament
export async function generateBracket(tournamentId: string) {
    const tournamentRef = doc(db, 'tournaments', tournamentId)
    const tournamentSnap = await getDoc(tournamentRef)
    if (!tournamentSnap.exists()) throw new Error('Tournament not found')

    const tournament = tournamentSnap.data() as Tournament

    // Check if bracket already exists
    const matchesRef = collection(db, 'matches_detailed')
    const qMatches = query(matchesRef, where('tournamentId', '==', tournamentId))
    const existingMatches = await getDocs(qMatches)
    if (!existingMatches.empty) throw new Error('Bracket already generated')

    // Fetch Registrations
    const regsRef = collection(db, 'tournament_registrations')
    const qRegs = query(regsRef, where('tournamentId', '==', tournamentId))
    const regSnaps = await getDocs(qRegs)
    const registrations = regSnaps.docs.map(d => d.data() as TournamentRegistration)

    if (registrations.length < 2) throw new Error('Not enough teams to generate bracket')

    const batch = writeBatch(db)

    // For Elimination Tournaments
    if (tournament.type === 'ELIMINATION' || tournament.type === 'GROUP_KNOCKOUT') {
        const teams = registrations.map(r => r.teamId!)
        await generateEliminationBracket(tournament, teams, batch)
    }
    // Add other types like BATTLE_ROYALE here if needed

    // Update Tournament Status
    batch.update(tournamentRef, { status: 'ongoing' })

    await batch.commit()
}

async function generateEliminationBracket(tournament: Tournament, teamIds: string[], batch: any) {
    // 1. Shuffle Seeds
    const shuffledTeams = teamIds.sort(() => Math.random() - 0.5)

    // 2. Calculate Bracket Size (Power of 2)
    const teamCount = shuffledTeams.length
    let powerOf2 = 2
    while (powerOf2 < teamCount) powerOf2 *= 2

    const byes = powerOf2 - teamCount
    const totalRounds = Math.log2(powerOf2)

    console.log(`Generating bracket for ${teamCount} teams. Size: ${powerOf2}. Byes: ${byes}`)

    // 3. Generate Matches
    // We only generate Round 1 matches and necessary placeholders for next rounds
    // Actually, primarily Round 1.

    // Round 1 Matches
    // Logic: 
    // Total Slots = powerOf2.
    // Top (powerOf2 - byes) teams play in Round 1? No.
    // Standard approach: 
    // n = teamCount.
    // If n is power of 2, 1st round has n/2 matches.
    // If n is NOT power of 2, we have a "Play-in" or "Round 1" that reduces field to a power of 2?
    // OR we distribute BYEs.
    // Common approach:
    // Round 1 has (teamCount - byes) teams playing? No.
    // Number of Round 1 matches = teamCount - (powerOf2 / 2). 
    // Example: 6 teams. Next pow2 = 8. Byes = 2.
    // Round 1 matches = 6 - 4 = 2 matches. (4 teams play, 2 advance). 
    // 2 byes (2 teams advance directly).
    // Total Round 2 (QF) teams = 2 (from R1) + 2 (byes) = 4. Correct.

    // Let's implement seeded placement simulation
    // Slot 1 vs Slot 2, Slot 3 vs Slot 4...
    // If Slot is Empty -> BYE.

    // Better algo:
    // Slots 1..powerOf2.
    // Teams 1..teamCount fill slots 1..teamCount.
    // Slots teamCount+1..powerOf2 are BYEs? No that's not balanced.

    // Simple Algo:
    // First round matches: (teamCount - powerOf2/2) * 2 teams play.
    // The rest get byes.

    const round1MatchCount = teamCount - (powerOf2 / 2)
    const teamsPlayingInRound1 = round1MatchCount * 2
    const teamsWithByes = teamCount - teamsPlayingInRound1

    // Teams playing in R1
    const r1Teams = shuffledTeams.slice(0, teamsPlayingInRound1)
    // Teams skipping R1
    const byeTeams = shuffledTeams.slice(teamsPlayingInRound1)

    // Create Round 1 Matches
    let matchCounter = 1
    const round1MatchIds: string[] = [] // Store IDs to link to next round if we pre-gen structure

    // NOTE: Simpler for dynamic systems: Just generate the matches that are READY to be played.
    // But we need the structure.

    // Let's generate ALL match slots for valid bracket visualization?
    // Or just generate executable matches.
    // User wants "Automatic Bracket Generation" and "Brackets publicly visible".
    // Usually implies a visual tree. A visual tree needs a predictable structure.
    // Structure: Round 1 (1..N), Round 2 (1..N/2), etc.

    // Let's use a simpler linear generation for execution:
    // Round 1:
    for (let i = 0; i < r1Teams.length; i += 2) {
        await createMatch(tournament, 1, matchCounter++, r1Teams[i], r1Teams[i + 1], batch)
    }

    // Round 2 (and beyond?)
    // If we have BYEs, those teams are waiting in Round 2.
    // Effectively, we need to create "Placeholder" matches for Round 2?
    // Or we just conceptually say they are in Round 2.

    // To enable nice UI, we usually pre-calculate the whole tree.
    // Let's create empty matches for future rounds.

    let currentRoundMatches = powerOf2 / 2
    let round = 1
    let globalMatchNum = 1

    // Re-think: Visual Bracket usually expects a full binary tree.
    // Slots 1 to powerOf2.
    // Match 1: Seed 1 vs Seed X...

    // Let's stick to robust matchmaking:
    // Create Round 1 matches. 
    // Create "TBD" matches for subsequent rounds so the tree is visible.

    // Matches array to hold IDs for linking
    const roundMatches: any[][] = []

    // Generate Round 1
    // We have `powerOf2 / 2` positions in the first "full" round (e.g. Round of 8).
    // But if we have byes, some matches are "Bye Matches" (auto-win) or we skip them?
    // Standard representation:
    // If 6 teams (Ro8). 
    // Match 1: Team 1 vs Team 2
    // Match 2: Team 3 vs Team 4
    // Match 3: Team 5 vs BYE (Team 5 auto-advances)
    // Match 4: Team 6 vs BYE (Team 6 auto-advances)
    // This is the easiest way to handle Byes for generic brackets.
    // Fill the bracket with BYEs to reach powerOf2.

    const bracketSlots = [...shuffledTeams]
    while (bracketSlots.length < powerOf2) {
        bracketSlots.push('BYE')
    }

    // Now we have powerOf2 slots (e.g., 8). Pairs: (0,1), (2,3), (4,5), (6,7).
    // Create matches for Round 1
    const nextRoundFeeds: string[] = [] // IDs of matches feeding into next round

    for (let i = 0; i < bracketSlots.length; i += 2) {
        const teamA = bracketSlots[i]
        const teamB = bracketSlots[i + 1]

        const isByeMatch = teamA === 'BYE' || teamB === 'BYE'
        const isDoubleBye = teamA === 'BYE' && teamB === 'BYE' // Shouln't happen if Shuffle is good and count > 0

        // If one is BYE, the other advances immediately?
        // Yes. In a visual bracket, we often show "Team A vs Bye".
        // Status: 'completed', Winner: Team A.

        const matchId = doc(collection(db, 'matches_detailed')).id
        nextRoundFeeds.push(matchId)

        let status = 'scheduled'
        let winnerId = null

        if (teamB === 'BYE') {
            status = 'completed' // Auto-win
            winnerId = teamA !== 'BYE' ? teamA : null
        } else if (teamA === 'BYE') {
            status = 'completed'
            winnerId = teamB !== 'BYE' ? teamB : null
        }

        const matchData = {
            id: matchId,
            tournamentId: tournament.id,
            tournamentName: tournament.title,
            game: tournament.game,
            matchNumber: globalMatchNum++,
            round: 1,
            // If it's a BYE, teams might be null or string 'BYE'. 
            // We need to fetch Team details if valid ID.
            // For batch simplicity, we might just store IDs and let UI/Trigger resolve names?
            // Or fetch them now.
            // Let's store simplified request for now.
            teamA: { id: teamA !== 'BYE' ? teamA : 'BYE', name: teamA !== 'BYE' ? 'TBD' : 'BYE' }, // We'll fix names later
            teamB: { id: teamB !== 'BYE' ? teamB : 'BYE', name: teamB !== 'BYE' ? 'TBD' : 'BYE' },
            status: status,
            result: winnerId ? { winner: winnerId === teamA ? 'teamA' : 'teamB', teamAStats: { totalPoints: 0 }, teamBStats: { totalPoints: 0 } } : null,
            createdAt: new Date(),
            scheduledAt: tournament.startDate
        }

        // We really should fetch names. 
        // OPTIMIZATION: Fetch all team names in one go before loop.
    }

    // Actually, I can write a simplified 'createMatch' helper.
}

async function createMatch(tournament: Tournament, round: number, matchNum: number, teamA: string, teamB: string, batch: any) {
    const format = tournament.game
    // Fetch team details helper...
    // To save specific implementation time now, I'll rely on the fact that I can fetch them.
    // ...
}

// NOTE: To make this ROBUST and CLEAN, I will output the file with proper logic:
// 1. Fetch team map (id -> name/logo).
// 2. Loop slots -> create Round 1 matches.
//      - If BYE involved, mark COMPLETED and set winner.
//      - Else mark SCHEDULED.
// 3. Create subsequent rounds as TBD matches (placeholder).
//      - Link dependencies? (Match X winner goes to Match Y team A).
//      - Standard binary tree math: Round R, Match M feeds into Round R+1, Match ceil(M/2).
