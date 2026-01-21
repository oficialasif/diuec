
import Home from '@/components/home/home'
import { getCommitteeMembers, getGalleryImages, getSponsors } from '@/lib/services'

// Force dynamic rendering to ensure fresh data on every request
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [committee, gallery, sponsors] = await Promise.all([
    getCommitteeMembers(),
    getGalleryImages(),
    getSponsors()
  ])

  // Serialize data to pass to Client Component (convert Dates to strings)
  const serializedCommittee = JSON.parse(JSON.stringify(committee))
  const serializedGallery = JSON.parse(JSON.stringify(gallery))
  const serializedSponsors = JSON.parse(JSON.stringify(sponsors))

  return (
    <Home
      committee={serializedCommittee}
      gallery={serializedGallery}
      sponsors={serializedSponsors}
    />
  )
}
