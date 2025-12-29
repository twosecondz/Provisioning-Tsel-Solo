import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase' // Sesuaikan path ini dengan config supabase Anda

export function useTodayOrders() {
  const [data, setData] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchTodayOrders() {
      try {
        setLoading(true)
        console.log("🚀 Memulai Fetching Data...") // LOG 1

        const { data: result, error } = await supabase
          .rpc('get_today_total_orders')

        console.log("📦 Respon dari Supabase:", result) // LOG 2
        console.log("❌ Error dari Supabase (jika ada):", error) // LOG 3

        if (error) throw error
        setData(result || 0)
      } catch (err) {
        const errorMessage = (err as any).message || 'Terjadi kesalahan tidak diketahui'
        
        setError(errorMessage)
        console.error('Error fetching today orders:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTodayOrders()
    
    // Auto refresh setiap 30 detik
    const interval = setInterval(fetchTodayOrders, 30000)
    
    return () => clearInterval(interval)
  }, [])

  return { data, loading, error }
}