
import React, { useState } from 'react'
import { MatchDetailed } from '@/lib/models/match-stats'
import { Trophy, Swords, Clock, Calendar as CalendarIcon, Edit2, X, Check } from 'lucide-react'
import Image from 'next/image'
import { getValidImageUrl } from '@/lib/utils/image'
import { format } from 'date-fns'
import { useAuth } from '@/contexts/auth-context'
import { updateMatchSchedule } from '@/lib/services/match-services'
import toast from 'react-hot-toast'

interface SymmetricBracketProps {
    matches: MatchDetailed[]
}

export const SymmetricBracket = ({ matches }: SymmetricBracketProps) => {
    // 1. Organize matches by Round
    const rounds: Record<number, MatchDetailed[]> = {}
    matches.forEach(m => {
        const r = (m as any).round || 1
        if (!rounds[r]) rounds[r] = []
        rounds[r].push(m)
    })

    const roundNumbers = Object.keys(rounds).map(Number).sort((a, b) => a - b)
    const totalRounds = roundNumbers.length

    if (totalRounds === 0) return <div className="text-center text-gray-500">No matches found</div>

    // 2. Identify The Final (Last Round)
    const finalRoundNum = roundNumbers[roundNumbers.length - 1]
    const finalMatches = rounds[finalRoundNum] || []
    const grandFinal = finalMatches[0]

    // 3. Split other rounds
    const leftSideRounds: Record<number, MatchDetailed[]> = {}
    const rightSideRounds: Record<number, MatchDetailed[]> = {}

    for (let r = 1; r < finalRoundNum; r++) {
        const roundMatches = rounds[r].sort((a, b) => a.matchNumber - b.matchNumber)
        const midpoint = Math.ceil(roundMatches.length / 2)
        leftSideRounds[r] = roundMatches.slice(0, midpoint)
        rightSideRounds[r] = roundMatches.slice(midpoint)
    }

    const renderColumn = (columnMatches: MatchDetailed[], side: 'left' | 'right') => {
        return (
            <div className="flex flex-col justify-around h-full gap-2 py-4">
                {columnMatches.map(match => (
                    <MatchCard key={match.id} match={match} side={side} />
                ))}
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-w-max mx-auto px-4 md:px-8">

            {/* LEFT SIDE (Rounds 1 to N-1) */}
            <div className="flex gap-4 md:gap-8 items-stretch">
                {roundNumbers.slice(0, -1).map(r => (
                    <div key={`left-${r}`} className="flex flex-col">
                        <div className="text-center mb-2 text-[10px] font-bold text-blue-500/50 uppercase tracking-widest">R{r}</div>
                        {renderColumn(leftSideRounds[r], 'left')}
                    </div>
                ))}
            </div>

            {/* CENTER (CHAMPION & FINAL) */}
            <div className="flex flex-col justify-center items-center px-4 md:px-8 z-10 mx-2 md:mx-4 shrink-0">
                <div className="flex flex-col items-center mb-4">
                    <Trophy className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.4)]" />
                    <h2 className="text-yellow-500 font-bold tracking-widest text-[10px] mt-1 uppercase">CHAMPION</h2>
                    {grandFinal?.status === 'approved' && grandFinal.result?.winner ? (
                        <div className="mt-1 bg-yellow-500/10 px-3 py-0.5 rounded-full border border-yellow-500/30 text-yellow-200 font-bold text-[10px] animate-pulse">
                            {grandFinal.result.winner === 'teamA' ? grandFinal.teamA.name : grandFinal.teamB.name}
                        </div>
                    ) : (
                        <div className="mt-1 text-gray-700 text-[9px] uppercase tracking-wider">TBD</div>
                    )}
                </div>

                <div className="relative">
                    {grandFinal && <MatchCard match={grandFinal} side="center" isFinal />}
                </div>
            </div>

            {/* RIGHT SIDE (Rounds 1 to N-1, REVERSED) */}
            <div className="flex gap-4 md:gap-8 items-stretch flex-row-reverse">
                {roundNumbers.slice(0, -1).map(r => (
                    <div key={`right-${r}`} className="flex flex-col">
                        <div className="text-center mb-2 text-[10px] font-bold text-blue-500/50 uppercase tracking-widest">R{r}</div>
                        {renderColumn(rightSideRounds[r], 'right')}
                    </div>
                ))}
            </div>

        </div>
    )
}

const MatchCard = ({ match, side, isFinal }: { match: MatchDetailed, side: 'left' | 'right' | 'center', isFinal?: boolean }) => {
    const { user, loading } = useAuth()
    const isAdmin = user?.role === 'admin'

    // Scheduling State
    const [isEditing, setIsEditing] = useState(false)
    const [scheduleTime, setScheduleTime] = useState('')
    const [saving, setSaving] = useState(false)

    // Styling Helpers
    const isWinnerA = match.status === 'approved' && match.result?.winner === 'teamA'
    const isWinnerB = match.status === 'approved' && match.result?.winner === 'teamB'

    const getBg = (isWinner: boolean) => isWinner
        ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-[0_0_8px_rgba(16,185,129,0.3)] border-emerald-500/50'
        : 'bg-[#1e293b] text-slate-400 border-slate-700/50'

    const scoreA = match.result?.teamAStats?.totalPoints
    const scoreB = match.result?.teamBStats?.totalPoints

    // Format Schduled Time
    const formattedTime = match.scheduledAt
        ? format(new Date((match.scheduledAt as any).seconds ? (match.scheduledAt as any).seconds * 1000 : match.scheduledAt), 'MMM d, h:mm a')
        : null

    const handleSaveSchedule = async (e: React.FormEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (!scheduleTime) return

        try {
            setSaving(true)
            await updateMatchSchedule(match.id, new Date(scheduleTime))
            toast.success('Schedule updated')
            setIsEditing(false)
            // Ideally we should trigger a refresh here, but for now strict local update logic or page refresh is needed. 
            // In a real app we'd use a context or callback to refresh data. 
            // The user will see update on next load.
            window.location.reload() // Force reload for now to see changes immediately
        } catch (error) {
            console.error(error)
            toast.error('Failed to update schedule')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className={`
            relative flex flex-col group/card
            ${isFinal ? 'w-44 scale-110' : 'w-36'}
            transition-all duration-300 hover:brightness-110 
        `}>
            {/* MATCH INFO HEADER (Time & Edit) */}
            <div className="flex justify-between items-center px-1 mb-0.5">
                <div className="flex items-center gap-1 text-[8px] text-slate-500 font-mono">
                    {formattedTime ? (
                        <>
                            <CalendarIcon className="w-2 h-2" />
                            <span>{formattedTime}</span>
                        </>
                    ) : (
                        <span className="opacity-50">Unscheduled</span>
                    )}
                </div>
                {isAdmin && !isEditing && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                        className="opacity-0 group-hover/card:opacity-100 transition-opacity p-0.5 hover:bg-slate-700 rounded text-slate-400"
                    >
                        <Edit2 className="w-2.5 h-2.5" />
                    </button>
                )}
            </div>

            {/* EDITING MODE OVERLAY */}
            {isEditing && (
                <div className="absolute inset-0 z-20 bg-slate-900 rounded-md border border-slate-600 flex flex-col items-center justify-center p-2 gap-1 shadow-xl">
                    <input
                        type="datetime-local"
                        className="w-full text-[9px] bg-black border border-slate-700 rounded px-1 py-0.5 text-white"
                        onChange={(e) => setScheduleTime(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex gap-2 mt-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsEditing(false); }}
                            className="bg-slate-700 hover:bg-slate-600 text-[9px] px-2 py-0.5 rounded text-white"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveSchedule}
                            disabled={saving}
                            className="bg-emerald-600 hover:bg-emerald-500 text-[9px] px-2 py-0.5 rounded text-white flex items-center gap-1"
                        >
                            {saving ? '...' : 'Save'}
                        </button>
                    </div>
                </div>
            )}

            {/* Team A */}
            <div className={`
                flex items-center gap-2 px-2 py-1 rounded-t-md border-x border-t
                ${getBg(isWinnerA)}
                ${side === 'right' ? 'flex-row-reverse text-right' : ''} 
            `}>
                <div className="w-3.5 h-3.5 rounded-full bg-black/30 flex-shrink-0 overflow-hidden relative">
                    {match.teamA.logo && <Image src={getValidImageUrl(match.teamA.logo, 'avatar')} alt="" fill className="object-cover" />}
                </div>
                <span className="text-[9px] font-bold truncate flex-1 leading-none tracking-tight">{match.teamA.name || 'TBD'}</span>
                {scoreA !== undefined && <span className="font-mono text-[9px] opacity-70 bg-black/20 px-1 rounded">{scoreA}</span>}
            </div>

            {/* Team B */}
            <div className={`
                flex items-center gap-2 px-2 py-1 rounded-b-md border-x border-b
                ${getBg(isWinnerB)}
                ${side === 'right' ? 'flex-row-reverse text-right' : ''}
            `}>
                <div className="w-3.5 h-3.5 rounded-full bg-black/30 flex-shrink-0 overflow-hidden relative">
                    {match.teamB.logo && <Image src={getValidImageUrl(match.teamB.logo, 'avatar')} alt="" fill className="object-cover" />}
                </div>
                <span className="text-[9px] font-bold truncate flex-1 leading-none tracking-tight">{match.teamB.name || 'TBD'}</span>
                {scoreB !== undefined && <span className="font-mono text-[9px] opacity-70 bg-black/20 px-1 rounded">{scoreB}</span>}
            </div>

            {/* Connector Lines */}
            {side === 'left' && !isFinal && (
                <div className="absolute -right-4 top-1/2 w-4 h-px bg-slate-800 hidden md:block group-hover:bg-slate-600 transition-colors"></div>
            )}
            {side === 'right' && !isFinal && (
                <div className="absolute -left-4 top-1/2 w-4 h-px bg-slate-800 hidden md:block group-hover:bg-slate-600 transition-colors"></div>
            )}
        </div>
    )
}
