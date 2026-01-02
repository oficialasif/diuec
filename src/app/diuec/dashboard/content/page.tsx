'use client'

export default function ContentPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Content Management</h1>
                <p className="text-gray-400">Moderate posts and manage content</p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
                <p className="text-gray-400">Content moderation features coming soon</p>
                <p className="text-sm text-gray-500 mt-2">Reported posts and content review will appear here</p>
            </div>
        </div>
    )
}
