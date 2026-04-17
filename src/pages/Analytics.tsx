import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '../hooks/use-auth'
import { BarChart3 } from 'lucide-react'
import AppShell from '../components/AppShell'
import { PageLoader } from '../components/Skeleton'

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
        <AppShell>
            <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
                {/* Page title */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="font-display text-2xl font-extrabold text-slate-900">Analytics</h1>
                        <p className="text-sm text-slate-500">Your event performance insights</p>
                    </div>
                </div>
                {/* Loading State */}
                {isLoading ? (
                    <PageLoader message="Loading analytics..." />
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
        </AppShell>
    )
}
