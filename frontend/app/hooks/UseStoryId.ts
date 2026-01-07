import axios from "axios"
import { useLocalSearchParams } from "expo-router"
import { useCallback, useEffect, useState } from "react"

export default function useStoryId() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [story, setStory] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const URL = process.env.EXPO_PUBLIC_BASE_URL

  const getStory = useCallback(async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      const res = await axios.get(`${URL}stories/${id}`)
      setStory(res.data)
    } catch (err) {
      console.log(err)
      setError("Unable to load story. Check your internet connection.")
      setStory(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    getStory()
  }, [getStory])

  return {
    story,
    loading,
    error,
    retry: getStory,
  }
}
