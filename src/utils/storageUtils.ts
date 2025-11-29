import { STORAGE_BUCKETS } from '../constants'

/**
 * Extract the file path from a Supabase Storage URL
 * @param fileUrl The full public URL of the file
 * @param bucketName The name of the bucket (optional, defaults to checking known buckets)
 * @returns The relative path within the bucket, or null if not found
 */
export const extractStoragePath = (fileUrl?: string | null, bucketName?: string): string | null => {
    if (!fileUrl) return null
    try {
        const url = new URL(fileUrl)
        const parts = url.pathname.split('/').filter(Boolean)

        // If bucket name is provided, look for it
        if (bucketName) {
            const bucketIndex = parts.indexOf(bucketName)
            if (bucketIndex === -1) return null
            return parts.slice(bucketIndex + 1).join('/')
        }

        // Otherwise try to find any known bucket
        for (const bucket of Object.values(STORAGE_BUCKETS)) {
            const bucketIndex = parts.indexOf(bucket)
            if (bucketIndex !== -1) {
                return parts.slice(bucketIndex + 1).join('/')
            }
        }

        return null
    } catch {
        return null
    }
}
