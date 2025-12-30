export async function uploadImage(file: File): Promise<string> {
    const timestamp = Math.round((new Date()).getTime() / 1000)

    // 1. Get Signature from our server
    const signResponse = await fetch('/api/cloudinary/sign', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            paramsToSign: {
                timestamp,
                upload_preset: 'ml_default', // Try default or leave out if using signed without preset logic, but usually signed needs eager/etc. 
                // Actually for standard signed upload we don't strictly need a preset if strictly authorized, 
                // but 'upload_preset' is often used. 
                // Let's TRY generic signed upload without preset first.
            }
        }),
    })

    // Start with simple signed params: timestamp
    // If we don't have a preset, we just sign 'timestamp'

    // Let's adjust the signature request to simple timestamp
    const signResponse2 = await fetch('/api/cloudinary/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            paramsToSign: { timestamp }
        })
    })

    const { signature, apiKey, cloudName } = await signResponse2.json()

    const formData = new FormData()
    formData.append('file', file)
    formData.append('api_key', apiKey)
    formData.append('timestamp', timestamp.toString())
    formData.append('signature', signature)

    // 2. Upload to Cloudinary
    const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
            method: 'POST',
            body: formData,
        }
    )

    const data = await uploadResponse.json()

    if (!uploadResponse.ok) {
        throw new Error(data.error?.message || 'Upload failed')
    }

    return data.secure_url
}
