import { NextResponse } from 'next/server'
import crypto from 'crypto'

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
const API_SECRET = process.env.CLOUDINARY_API_SECRET
const API_KEY = process.env.CLOUDINARY_API_KEY

export async function POST(request: Request) {
    try {
        // Validate all required environment variables
        if (!API_SECRET || !API_KEY || !CLOUD_NAME) {
            const missing = []
            if (!API_SECRET) missing.push('CLOUDINARY_API_SECRET')
            if (!API_KEY) missing.push('CLOUDINARY_API_KEY')
            if (!CLOUD_NAME) missing.push('CLOUDINARY_CLOUD_NAME')

            return NextResponse.json(
                { error: `Missing required environment variables: ${missing.join(', ')}` },
                { status: 500 }
            )
        }

        const body = await request.json()
        const { paramsToSign } = body

        const signature = generateSignature(paramsToSign, API_SECRET)

        return NextResponse.json({
            signature,
            apiKey: API_KEY,
            cloudName: CLOUD_NAME
        })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to generate signature' }, { status: 500 })
    }
}

function generateSignature(paramsToSign: Record<string, string | number>, apiSecret: string) {
    const sortedKeys = Object.keys(paramsToSign).sort()
    const stringToSign = sortedKeys
        .map((key) => `${key}=${paramsToSign[key]}`)
        .join('&')
        .concat(apiSecret)

    return crypto.createHash('sha1').update(stringToSign).digest('hex')
}
