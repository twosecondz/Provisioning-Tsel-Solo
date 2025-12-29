"use client"

export const dynamic = 'force-dynamic'

import { useDashboard } from "@/hooks/use-dashboard"
import { useBimaStatus } from "@/hooks/use-bima-status"
import { useUpdateLapangan } from "@/hooks/use-update-lapangan"
import { useDashboardKPI } from "@/hooks/use-dashboard-kpi" // Import Hooks yang sudah diupdate
import {
  MonthlyTrendChart,
  BIMAStatusChart,
  FieldUpdates
} from "@/components/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select" // Pastikan import ini ada
import { Upload, TrendingUp, BarChart3, PieChart, Activity, Calendar } from "lucide-react"
import { format, subMonths } from "date-fns" // Optional: untuk format tanggal yang cantik
import { id } from "date-fns/locale" // Optional: untuk Bahasa Indonesia

export default function DashboardPage() {
  const { csvData } = useDashboard()
  const { data: bimaStatusData, loading: bimaLoading, error: bimaError } = useBimaStatus()
  const { data: updateLapanganData, loading: updateLapanganLoading, error: updateLapanganError } = useUpdateLapangan()
  
  // Ambil selectedMonth dan setSelectedMonth dari hooks
  const { kpiData, isLoading: kpiLoading, selectedMonth, setSelectedMonth } = useDashboardKPI()

  // --- Helper untuk Generate Opsi Bulan (12 Bulan Terakhir) ---
  const generateMonthOptions = () => {
    const options = []
    const today = new Date()
    
    // Tambahkan opsi ALL
    options.push({ value: 'ALL', label: 'Semua Periode' })

    // Tambahkan 12 bulan terakhir
    for (let i = 0; i < 12; i++) {
      const date = subMonths(today, i)
      const value = format(date, 'yyyy-MM') // Format value: 2024-01
      const label = format(date, 'MMMM yyyy', { locale: id }) // Format label: Januari 2024
      options.push({ value, label })
    }
    return options
  }

  const monthOptions = generateMonthOptions()

  // ... (Kode Empty State tidak berubah) ...
  if (!csvData) {
    // ... (kode return empty state sama seperti sebelumnya) ...
    return (
        <div className="min-h-screen bg-[#1B2431] p-6">
            {/* ... Content Empty State ... */}
            <div className="max-w-7xl mx-auto space-y-8">
                <Card className="bg-gradient-to-br from-[#1e293b] to-[#334155] border-[#475569] shadow-xl">
                    <CardContent className="p-12 text-center">
                        <div className="text-white">Upload data dulu ya...</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1B2431] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header dengan Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
            <p className="text-gray-400">
               Monitoring performa PS dan RE secara real-time.
            </p>
          </div>

          {/* DROPDOWN FILTER */}
          <div className="w-full md:w-[250px]">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="bg-[#1e293b] border-[#475569] text-white">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-400"/>
                    <SelectValue placeholder="Pilih Bulan" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-[#1e293b] border-[#475569] text-white">
                {monthOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="focus:bg-[#334155] focus:text-white cursor-pointer"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* KPI Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* PS Card */}
          <Card className="bg-gradient-to-br from-[#1e293b] to-[#334155] border-[#475569] shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="py-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-300 tracking-wide">PS</h3>
                <div className="h-3 w-3 rounded-full bg-green-500/20 border-2 border-white/20"></div>
              </div>
              <div className="text-4xl font-bold text-white mb-3 tracking-tight">
                {kpiLoading ? "..." : kpiData.ps.toLocaleString()}
              </div>
              <div className="flex items-center text-gray-400 text-sm font-medium">
                <TrendingUp className="h-4 w-4 mr-2" />
                <span>
                    {selectedMonth === 'ALL' ? 'Total Keseluruhan' : 'Data Bulan Ini'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* RE Card */}
          <Card className="bg-gradient-to-br from-[#1e293b] to-[#334155] border-[#475569] shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-300 tracking-wide">RE</h3>
                <div className="h-3 w-3 rounded-full bg-blue-500/20 border-2 border-white/20"></div>
              </div>
              <div className="text-4xl font-bold text-white mb-3 tracking-tight">
                 {kpiLoading ? "..." : kpiData.re.toLocaleString()}
              </div>
              <div className="flex items-center text-gray-400 text-sm font-medium">
                <TrendingUp className="h-4 w-4 mr-2" />
                <span>Cancelled orders</span>
              </div>
            </CardContent>
          </Card>

          {/* PS/RE Ratio Card */}
          <Card className="bg-gradient-to-br from-[#1e293b] to-[#334155] border-[#475569] shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-300 tracking-wide">PS/RE</h3>
                <div className="h-3 w-3 rounded-full bg-green-500/20 border-2 border-white/20"></div>
              </div>
              <div className="text-4xl font-bold text-white mb-3 tracking-tight">
                {kpiLoading ? "..." : `${kpiData.psReRatio}%`}
              </div>
              <div className="flex items-center text-gray-400 text-sm font-medium">
                <TrendingUp className="h-4 w-4 mr-2" />
                <span>Rasio Kinerja</span>
              </div>
            </CardContent>
          </Card>

          {/* Target Static Card - Tidak Berubah */}
          <Card className="bg-gradient-to-br from-[#1e293b] to-[#334155] border-[#475569] shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-300 tracking-wide">Target Static</h3>
                <div className="h-3 w-3 rounded-full bg-red-500/20 border-2 border-white/20"></div>
              </div>
              <div className="text-4xl font-bold text-white mb-3 tracking-tight">75,12%</div>
              <div className="flex items-center text-gray-400 text-sm font-medium">
                <span>Per bulan</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ... Sisa komponen chart (MonthlyTrend, BIMAStatus, FieldUpdates) ... */}
        <Card className="bg-gradient-to-br from-[#1e293b] to-[#334155] border-[#475569] shadow-xl">
             {/* Chart Content sama seperti sebelumnya */}
             <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center space-x-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Activity className="h-5 w-5 text-blue-400" />
                    </div>
                    <span className="text-xl font-semibold">Tren Order Bulanan</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <MonthlyTrendChart />
            </CardContent>
        </Card>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* BIMA Status & Top Update Lapangan sama seperti sebelumnya */}
             <Card className="bg-gradient-to-br from-[#1e293b] to-[#334155] border-[#475569] shadow-xl">
                 <CardHeader className="pb-4">
                     <CardTitle className="text-white flex items-center space-x-3">
                         <div className="p-2 bg-purple-500/20 rounded-lg">
                            <PieChart className="h-5 w-5 text-purple-400" />
                        </div>
                        <span className="text-xl font-semibold">Distribusi Status BIMA</span>
                     </CardTitle>
                 </CardHeader>
                 <CardContent>
                     <BIMAStatusChart data={bimaStatusData} loading={bimaLoading} error={bimaError} />
                 </CardContent>
             </Card>

             <Card className="bg-gradient-to-br from-[#1e293b] to-[#334155] border-[#475569] shadow-xl">
                <CardHeader className="pb-4">
                    <CardTitle className="text-white flex items-center space-x-3">
                         <div className="p-2 bg-green-500/20 rounded-lg">
                            <BarChart3 className="h-5 w-5 text-green-400" />
                        </div>
                        <span className="text-xl font-semibold">Top Update Lapangan</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <FieldUpdates data={updateLapanganData} loading={updateLapanganLoading} error={updateLapanganError} />
                </CardContent>
             </Card>
        </div>

      </div>
    </div>
  )
}