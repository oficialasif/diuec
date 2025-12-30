import { NextResponse } from 'next/server'
import crypto from 'crypto'

const CLOUD_NAME = 'dn7ucxk8a'
const API_SECRET = 'oNE1GqwM-WYb_REcNFr39eqwCY0'
const API_KEY = '246184425446679'

export async function POST(request: Request) {
    try {
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
