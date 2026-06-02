import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface AttendanceSummaryProps {
    totalDays: number;
    daysAttended: number;
    daysAbsent: number;
}

export default function AttendanceSummaryCard({ totalDays, daysAttended, daysAbsent }: AttendanceSummaryProps) {
    const percentage = Math.round((daysAttended / totalDays) * 100) || 0;

    const data = [
        { name: 'Attended', value: daysAttended },
        { name: 'Remaining/Absent', value: totalDays - daysAttended },
    ];

    const COLORS = ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.25)'];

    return (
        <div className="mb-6 rounded-2xl bg-gradient-to-br from-[#fcb6c0] via-[#cc9ff0] to-[#b490f0] p-6 text-white shadow-xl shadow-pink-200/50 dark:shadow-purple-950/40">
            <h3 className="mb-1 font-medium text-white/80">Ringkasan Kehadiran</h3>

            <div className="mt-2 flex items-center justify-between">
                <div>
                    <div className="text-sm text-white/70">Total Hari</div>
                    <div className="text-2xl font-bold">{totalDays}</div>
                </div>

                <div className="relative -mr-2 h-24 w-24">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                startAngle={180}
                                endAngle={0}
                                innerRadius={30}
                                outerRadius={40}
                                stroke="none"
                                cornerRadius={20}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 top-3 flex flex-col items-center justify-center">
                        <span className="text-lg font-bold">{percentage}%</span>
                    </div>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/20 pt-4">
                <div>
                    <div className="mb-1 text-xs text-white/70">Hadir</div>
                    <div className="font-semibold">{daysAttended} hari</div>
                </div>
                <div>
                    <div className="mb-1 text-xs text-white/70">Absen / Izin</div>
                    <div className="font-semibold">{daysAbsent} hari</div>
                </div>
            </div>
        </div>
    );
}
