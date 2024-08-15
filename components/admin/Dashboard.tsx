import React from 'react';
import { ChartBarIcon, UserGroupIcon, LightBulbIcon, ChatBubbleLeftRightIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

interface DashboardProps {
  totalIdeas: number;
  totalUsers: number;
  totalComments: number;
  ideaStatusCounts: {
    pending: number;
    approved: number;
    rejected: number;
  };
  topCategories: { name: string; count: number }[];
  recentTrends: {
    newIdeasLastWeek: number;
    newUsersLastWeek: number;
    newCommentsLastWeek: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Dashboard: React.FC<DashboardProps> = ({
  totalIdeas,
  totalUsers,
  totalComments,
  ideaStatusCounts,
  topCategories,
  recentTrends,
}) => {
  const stats = [
    { name: 'Total Ideas', value: totalIdeas, icon: LightBulbIcon, color: 'bg-blue-500', trend: recentTrends.newIdeasLastWeek },
    { name: 'Total Users', value: totalUsers, icon: UserGroupIcon, color: 'bg-green-500', trend: recentTrends.newUsersLastWeek },
    { name: 'Total Comments', value: totalComments, icon: ChatBubbleLeftRightIcon, color: 'bg-yellow-500', trend: recentTrends.newCommentsLastWeek },
  ];

  const chartData = Object.entries(ideaStatusCounts).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
  }));

  const pieChartData = topCategories.map((category, index) => ({
    name: category.name,
    value: category.count,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden shadow-lg rounded-lg transition duration-300 ease-in-out transform hover:scale-105">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${item.color} rounded-md p-3`}>
                  <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{item.value}</div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${item.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.trend > 0 ? (
                          <ArrowTrendingUpIcon className="self-center flex-shrink-0 h-5 w-5 text-green-500" aria-hidden="true" />
                        ) : (
                          <ArrowTrendingDownIcon className="self-center flex-shrink-0 h-5 w-5 text-red-500" aria-hidden="true" />
                        )}
                        <span className="ml-1">{Math.abs(item.trend)}</span>
                        <span className="sr-only">{item.trend > 0 ? 'Increase' : 'Decrease'}</span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white overflow-hidden shadow-lg rounded-lg">
          <div className="p-5">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Idea Status Distribution</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg">
          <div className="p-5">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Top Categories</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow-lg rounded-lg">
        <div className="p-5">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Top Categories Details</h3>
          <div className="flow-root mt-6">
            <ul className="-my-5 divide-y divide-gray-200">
              {topCategories.map((category, index) => (
                <li key={category.name} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                        <span className="text-sm font-medium leading-none text-white">{index + 1}</span>
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{category.name}</p>
                      <p className="text-sm text-gray-500 truncate">{category.count} ideas</p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="relative w-24 bg-gray-200 rounded-full h-3">
                        <div 
                          className="absolute top-0 left-0 rounded-full h-3" 
                          style={{ 
                            width: `${(category.count / topCategories[0].count) * 100}%`,
                            backgroundColor: COLORS[index % COLORS.length]
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;