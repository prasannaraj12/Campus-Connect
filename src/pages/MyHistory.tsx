import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '../hooks/use-auth'
import AppShell from '../components/AppShell'
import { PageLoader } from '../components/Skeleton'
import {
    Calendar,
    MapPin,
    Clock,
    Award,
    CheckCircle,
    XCircle,
    Users,
    Trophy,
    Download
} from 'lucide-react'

export default function MyHistory() {
    const navigate = useNavigate()
    const { user } = useAuth()

    const history = useQuery(
        api.history.getMyAttendanceHistory,
        user?.userId ? { userId: user.userId } : 'skip'
    )

    const stats = useQuery(
        api.history.getMyStats,
        user?.userId ? { userId: user.userId } : 'skip'
    )

    if (!user) return null

    const isLoading = history === undefined || stats === undefined

    return (
        <AppShell>
            <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
                {/* Page title */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="font-display text-2xl font-extrabold text-slate-900">My History</h1>
                        <p className="text-sm text-slate-500">Your event participation journey</p>
                    </div>
                </div>
                {isLoading ? (
                    <PageLoader message="Loading your history..." />
                ) : (
                    <>
                        {/* Stats Cards */}
                        <section>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="w-5 h-5 text-blue-500" />
                                        <span className="text-xs font-semibold text-gray-500">Registered</span>
                                    </div>
                                    <p className="text-3xl font-black text-gray-900">{stats?.totalRegistrations || 0}</p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                                        <span className="text-xs font-semibold text-gray-500">Attended</span>
                                    </div>
                                    <p className="text-3xl font-black text-gray-900">{stats?.totalAttended || 0}</p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Award className="w-5 h-5 text-amber-500" />
                                        <span className="text-xs font-semibold text-gray-500">Rate</span>
                                    </div>
                                    <p className="text-3xl font-black text-gray-900">{stats?.attendanceRate || 0}%</p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Trophy className="w-5 h-5 text-purple-500" />
                                        <span className="text-xs font-semibold text-gray-500">Top Category</span>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900 truncate">
                                        {stats?.topCategory || 'N/A'}
                                    </p>
                                </motion.div>
                            </div>
                        </section>

                        {/* History List */}
                        <section>
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Event History</h2>

                            {history && history.length === 0 ? (
                                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                                    <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <h3 className="text-xl font-bold text-gray-700 mb-2">No Events Yet</h3>
                                    <p className="text-gray-500 mb-6">
                                        Register for events to start building your history.
                                    </p>
                                    <button
                                        onClick={() => navigate('/dashboard')}
                                        className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
                                    >
                                        Browse Events
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {history?.map((item, index) => (
                                        <motion.div
                                            key={item.registrationId}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${item.attended
                                                                ? 'bg-emerald-100 text-emerald-700'
                                                                : 'bg-gray-100 text-gray-600'
                                                            }`}>
                                                            {item.attended ? 'Attended' : 'Registered'}
                                                        </span>
                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                                            {item.eventCategory}
                                                        </span>
                                                        {item.isTeamEvent && (
                                                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold flex items-center gap-1">
                                                                <Users className="w-3 h-3" />
                                                                Team
                                                            </span>
                                                        )}
                                                    </div>

                                                    <h3
                                                        className="text-lg font-bold text-gray-900 mb-2 cursor-pointer hover:text-indigo-600 transition-colors"
                                                        onClick={() => navigate(`/event/${item.eventId}`)}
                                                    >
                                                        {item.eventTitle}
                                                    </h3>

                                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            {new Date(item.eventDate).toLocaleDateString('en-US', {
                                                                weekday: 'short',
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            {item.eventTime}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="w-4 h-4" />
                                                            {item.eventLocation}
                                                        </div>
                                                    </div>

                                                    {item.teamName && (
                                                        <p className="text-sm text-purple-600 mt-2">
                                                            Team: {item.teamName} {item.isTeamLeader && '(Leader)'}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex flex-col gap-2">
                                                    {item.attended ? (
                                                        <>
                                                            <div className="flex items-center gap-1 text-emerald-600">
                                                                <CheckCircle className="w-5 h-5" />
                                                            </div>
                                                            <button
                                                                onClick={() => navigate(`/ticket/${item.registrationId}`)}
                                                                className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-colors flex items-center gap-1"
                                                            >
                                                                <Download className="w-3 h-3" />
                                                                Certificate
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div className="flex items-center gap-1 text-gray-400">
                                                            <XCircle className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {item.attended && item.attendedAt && (
                                                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                                                    Checked in: {new Date(item.attendedAt).toLocaleString()}
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>
        </AppShell>
    )
}
