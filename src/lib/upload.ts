export async function uploadImage(file: File, folder?: string): Promise<string> {
    const timestamp = Math.round((new Date()).getTime() / 1000)

    // Prepare params to sign
    const paramsToSign: any = { timestamp }
    if (folder) {
        paramsToSign.folder = folder
    }

    // Get Signature from server
    const signResponse = await fetch('/api/cloudinary/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paramsToSign })
    })

    const { signature, apiKey, cloudName } = await signResponse.json()

    const formData = new FormData()
    formData.append('file', file)
    formData.append('api_key', apiKey)
    formData.append('timestamp', timestamp.toString())
    formData.append('signature', signature)
    if (folder) {
        formData.append('folder', folder)
    }

    // Upload to Cloudinary
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
