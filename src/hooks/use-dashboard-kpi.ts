"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"

interface DashboardKPI {
  ps: number
  re: number
  totalOrder: number
  orderComplete: number
  psReRatio: number
  targetStatic: number
  targetAchievement: number
}

export function useDashboardKPI() {
  // Default ke bulan saat ini (Format: YYYY-MM)
  const getCurrentMonthISO = () => new Date().toISOString().slice(0, 7)
  
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthISO())
  
  const [kpiData, setKpiData] = useState<DashboardKPI>({
    ps: 0,
    re: 0,
    totalOrder: 0,
    orderComplete: 0,
    psReRatio: 0,
    targetStatic: 75.12,
    targetAchievement: 0
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Gunakan useCallback agar fungsi tidak dibuat ulang setiap render, mencegah infinite loop di useEffect
  const calculateKPI = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const now = new Date()
      // Note: Logic oneMonthAgo ini mungkin perlu disesuaikan jika ingin orderComplete mengikuti filter bulan juga.
      // Untuk sekarang saya biarkan logic orderComplete seperti aslinya (berbasis 30 hari terakhir dari now),
      // Tapi PS/RE akan mengikuti filter bulan.
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

      // Fetch all data
      const { data: orders, error: fetchError } = await supabase
        .from('format_order')
        .select('order_id, status_bima, status_dsc, date_created, tanggal_ps')
        .order('date_created', { ascending: false })

      if (fetchError) throw new Error(`Database fetch error: ${fetchError.message}`)
      if (!orders || orders.length === 0) return

      // --- FILTERING LOGIC ---
      let filteredOrders = orders

      if (selectedMonth !== 'ALL') {
        filteredOrders = orders.filter(order => {
          if (!order.date_created) return false
          // Ambil 7 karakter pertama (YYYY-MM) dari date_created
          const orderMonth = order.date_created.slice(0, 7) 
          return orderMonth === selectedMonth
        })
      }
      
      console.log(`Processing ${filteredOrders.length} orders for KPI (Filter: ${selectedMonth})`)
      // -----------------------

      let psCount = 0
      let reCount = 0
      let totalOrderCount = 0
      let orderCompleteCount = 0

      // Gunakan filteredOrders, bukan orders
      filteredOrders.forEach((order) => {
        const statusBima = (order.status_bima || '').trim().toLowerCase()
        const statusDsc = (order.status_dsc || '').trim().toLowerCase()
        const dateCreated = order.date_created
        const tanggalPs = order.tanggal_ps

        // Count PS
        if (tanggalPs && tanggalPs.trim() !== '') {
          psCount++
        }

        // Count RE logic
        const isCancelWork = statusBima.includes('cancel') || statusBima.includes('canclwork')
        const hasStatusDsc = statusDsc && statusDsc.trim() !== ''
        
        if (!tanggalPs || tanggalPs.trim() === '') {
          if (!(isCancelWork && hasStatusDsc)) {
            reCount++
          }
        }

        // Count Total Orders
        if (tanggalPs && tanggalPs.trim() !== '') {
          totalOrderCount++
        } else {
          if (!(isCancelWork && hasStatusDsc)) {
            totalOrderCount++
          }
        }

        // Count Order Complete 
        // (Logic asli Anda mempertahankan 1 bulan terakhir dari SEKARANG, bukan dari filter bulan)
        // Jika ingin orderComplete juga ikut filter bulan, logic di bawah perlu diubah.
        if (dateCreated) {
          try {
            const orderDate = new Date(dateCreated)
            if (!isNaN(orderDate.getTime()) && orderDate >= oneMonthAgo) {
              const isComplete = statusBima.includes('complete') || 
                               statusBima.includes('success') || 
                               statusBima.includes('done') ||
                               statusBima.includes('resolved')
              
              if (isComplete) orderCompleteCount++
            }
          } catch (e) { console.warn(e) }
        }
      })

      // Calculate ratios
      const psReRatio = reCount > 0 ? (psCount / reCount) * 100 : 0
      const targetStatic = 75.12
      const targetAchievement = targetStatic > 0 ? (psReRatio / targetStatic) * 100 : 0

      setKpiData({
        ps: psCount,
        re: reCount,
        totalOrder: totalOrderCount,
        orderComplete: orderCompleteCount,
        psReRatio: Math.round(psReRatio * 100) / 100,
        targetStatic: targetStatic,
        targetAchievement: Math.round(targetAchievement * 100) / 100
      })

    } catch (err) {
      console.error("Error calculating KPI:", err)
      setError(err instanceof Error ? err.message : "Failed to calculate KPI")
    } finally {
      setIsLoading(false)
    }
  }, [selectedMonth]) // Re-run if selectedMonth changes

  useEffect(() => {
    calculateKPI()
    const intervalId = setInterval(calculateKPI, 5 * 60 * 1000)
    
    const handleDataUpdate = () => {
        console.log("Data updated (event), recalculating KPI...")
        calculateKPI()
    }
    window.addEventListener('csvDataUpdated', handleDataUpdate)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener('csvDataUpdated', handleDataUpdate)
    }
  }, [calculateKPI]) // Dependency on calculateKPI (which depends on selectedMonth)

  return {
    kpiData,
    isLoading,
    error,
    refreshKPI: calculateKPI,
    selectedMonth,      // Export state
    setSelectedMonth    // Export setter
  }
}