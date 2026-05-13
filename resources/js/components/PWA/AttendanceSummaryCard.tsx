import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface AttendanceSummaryProps {
    totalDays: number;
    daysAttended: number;
    daysAbsent: number;
}

export default function AttendanceSummaryCard({ totalDays, daysAttended, daysAbsent }: AttendanceSummaryProps) {
    const percentage = Math.round((daysAttended / totalDays) * 100) || 0;
    
    // For a half-donut pie chart
    const data = [
        { name: 'Attended', value: daysAttended },
        { name: 'Remaining/Absent', value: totalDays - daysAttended }
    ];

    const COLORS = ['#ffffff', 'rgba(255,255,255,0.3)'];

    return (
        <div className="bg-indigo-500 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200/50 mb-6">
            <h3 className="text-indigo-100 font-medium mb-1">Attendance Summary</h3>
            
            <div className="flex items-center justify-between mt-2">
                <div>
                    <div className="text-sm text-indigo-200">Total Days</div>
                    <div className="text-2xl font-bold">{totalDays}</div>
                </div>

                <div className="w-24 h-24 relative -mr-2">
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
                    <div className="absolute inset-0 flex flex-col items-center justify-center top-3">
                        <span className="text-lg font-bold">{percentage}%</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 border-t border-indigo-400/30 pt-4">
                <div>
                    <div className="text-xs text-indigo-200 mb-1">Days Attended</div>
                    <div className="font-semibold">{daysAttended}</div>
                </div>
                <div>
                    <div className="text-xs text-indigo-200 mb-1">Days Absent/Leaves</div>
                    <div className="font-semibold">{daysAbsent}</div>
                </div>
            </div>
        </div>
    );
}
