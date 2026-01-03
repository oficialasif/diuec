export interface GameRules {
    format: string
    matchRules: string[]
    pointSystem?: string[]
    restrictions?: string[]
}

export const GAME_RULES: Record<string, GameRules> = {
    'EFOOTBALL': {
        format: '1v1 or Co-op (2v2)',
        matchRules: [
            'Match Duration: 10 Minutes',
            'Injuries: Off',
            'Condition: Normal (yellow arrow)',
            'Extra Time: Off (Group Stage), On (Knockout)',
            'Penalties: On (Knockout)',
            'Game Speed: 0',
            'Substitutions: 3 (+1 in Extra Time)'
        ],
        pointSystem: [
            'Win: 3 Points',
            'Draw: 1 Point',
            'Loss: 0 Points'
        ],
        restrictions: [
            'No usage of legacy or special cards (if specified by tournament)',
            'Stable internet connection required'
        ]
    },
    'PUBG': {
        format: 'Squad (4 Players)',
        matchRules: [
            'Map: Erangel / Miramar / Sanhok',
            'Perspective: TPP',
            'Server Region: Asia',
            'Emulators: Not Allowed (unless specified)'
        ],
        pointSystem: [
            '1st Place: 15 Pts',
            '2nd Place: 12 Pts',
            '3rd Place: 10 Pts',
            '4th Place: 8 Pts',
            '5th Place: 6 Pts',
            '6th Place: 4 Pts',
            '7th-8th: 2 Pts',
            '9th-16th: 1 Pt',
            'Kill: 1 Pt'
        ]
    },
    'FREE_FIRE': {
        format: 'Squad (4 Players)',
        matchRules: [
            'Map: Bermuda / Purgatory',
            'No Gun Attributes',
            'Character Skills: On',
            'Emulators: Not Allowed'
        ],
        pointSystem: [
            'Booyah: 12 Pts',
            '2nd Place: 9 Pts',
            '3rd Place: 8 Pts',
            '4th Place: 7 Pts',
            '5th Place: 6 Pts',
            '6th Place: 5 Pts',
            '7th Place: 4 Pts',
            '8th Place: 3 Pts',
            '9th Place: 2 Pts',
            '10th-12th: 1 Pt',
            'Kill: 1 Pt'
        ]
    }
}
