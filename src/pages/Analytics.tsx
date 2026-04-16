import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '../hooks/use-auth'
import { ArrowLeft, BarChart3, RefreshCw } from 'lucide-react'

import OverviewStats from '../components/analytics/OverviewStats'
import RegistrationTrendChart from '../components/analytics/RegistrationTrendChart'
import CategoryPieChart from '../components/analytics/CategoryPieChart'
import AttendanceBarChart from '../components/analytics/AttendanceBarChart'
import PeakTimesChart from '../components/analytics/PeakTimesChart'

export default function Analytics() {
    const navigate = useNavigate()
    const { user } = useAuth()

    // Fetch analytics data
    const overviewStats = useQuery(
        api.analytics.getOrganizerAnalytics,
        user?.userId ? { organizerId: user.userId } : 'skip'
    )
    const registrationTrends = useQuery(
        api.analytics.getRegistrationTrends,
        user?.userId ? { organizerId: user.userId } : 'skip'
    )
    const categoryStats = useQuery(
        api.analytics.getCategoryStats,
        user?.userId ? { organizerId: user.userId } : 'skip'
    )
    const attendanceRates = useQuery(
        api.analytics.getAttendanceRates,
        user?.userId ? { organizerId: user.userId } : 'skip'
    )
    const peakTimes = useQuery(
        api.analytics.getPeakRegistrationTimes,
        user?.userId ? { organizerId: user.userId } : 'skip'
    )

    if (!user || user.role !== 'organizer') {
        return null
    }

    const isLoading =
        overviewStats === undefined ||
        registrationTrends === undefined ||
        categoryStats === undefined ||
        attendanceRates === undefined ||
        peakTimes === undefined

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-gray-900">Analytics</h1>
                            <p className="text-xs text-gray-500">Your event performance insights</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-6 space-y-6">
                {/* Loading State */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                            <RefreshCw className="w-8 h-8 text-indigo-500" />
                        </motion.div>
                        <p className="mt-4 text-gray-500 font-medium">Loading analytics...</p>
                    </div>
                ) : (
                    <>
                        {/* Overview Stats */}
                        <section>
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Overview</h2>
                            <OverviewStats
                                totalEvents={overviewStats?.totalEvents || 0}
                                totalRegistrations={overviewStats?.totalRegistrations || 0}
                                totalAttendance={overviewStats?.totalAttendance || 0}
                                attendanceRate={overviewStats?.attendanceRate || 0}
                                upcomingEvents={overviewStats?.upcomingEvents || 0}
                            />
                        </section>

                        {/* Charts Grid */}
                        <section>
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Insights</h2>
                            <div className="grid lg:grid-cols-2 gap-6">
                                <RegistrationTrendChart data={registrationTrends || []} />
                                <CategoryPieChart data={categoryStats || []} />
                                <AttendanceBarChart data={attendanceRates || []} />
                                <PeakTimesChart data={peakTimes || []} />
                            </div>
                        </section>

                        {/* Empty State */}
                        {overviewStats?.totalEvents === 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm"
                            >
                                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <h3 className="text-xl font-bold text-gray-700 mb-2">No Data Yet</h3>
                                <p className="text-gray-500 mb-6">
                                    Create your first event to start seeing analytics.
                                </p>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                                >
                                    Go to Dashboard
                                </button>
                            </motion.div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
