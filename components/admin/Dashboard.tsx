import React from 'react';
import { ChartBarIcon, UserGroupIcon, LightBulbIcon, ChatBubbleLeftRightIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import 'tippy.js/animations/shift-away.css';

interface DashboardProps {
  totalIdeas: number;
  totalUsers: number;
  totalComments: number;
  totalVotes: number;
  ideaStatusCounts: {
    [status: string]: number;
  };
  topCategories: Array<{ name: string; count: number }>;
  recentTrends: {
    newIdeasLastWeek: number;
    newUsersLastWeek: number;
    newCommentsLastWeek: number;
    newVotesLastWeek: number;
  };
  weeklyData: Array<{
    week: string;
    ideas: number;
    users: number;
    comments: number;
    votes: number;
  }>;
  topUsersByIdeas: Array<{ id: number; name: string; ideaCount: number }>;
  topIdeasByVotes: Array<{ id: number; title: string; voteCount: number }>;
  userEngagement: {
    averageIdeasPerUser: number;
    averageCommentsPerUser: number;
    averageVotesPerUser: number;
  };
  ideaSuccessRate: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const Dashboard: React.FC<DashboardProps> = ({
  totalIdeas,
  totalUsers,
  totalComments,
  totalVotes,
  ideaStatusCounts,
  topCategories,
  recentTrends,
  weeklyData,
  topUsersByIdeas,
  topIdeasByVotes,
  userEngagement,
  ideaSuccessRate,
}) => {
  const stats = [
    { 
      name: 'Total Ideas', 
      value: totalIdeas, 
      icon: LightBulbIcon, 
      color: 'bg-blue-500', 
      trend: recentTrends.newIdeasLastWeek,
      tooltip: 'Total number of ideas submitted to the platform'
    },
    { 
      name: 'Total Users', 
      value: totalUsers, 
      icon: UserGroupIcon, 
      color: 'bg-green-500', 
      trend: recentTrends.newUsersLastWeek,
      tooltip: 'Total number of registered users on the platform'
    },
    { 
      name: 'Total Comments', 
      value: totalComments, 
      icon: ChatBubbleLeftRightIcon, 
      color: 'bg-yellow-500', 
      trend: recentTrends.newCommentsLastWeek,
      tooltip: 'Total number of comments made on all ideas'
    },
    { 
      name: 'Total Votes', 
      value: totalVotes, 
      icon: ChartBarIcon, 
      color: 'bg-red-500', 
      trend: recentTrends.newVotesLastWeek,
      tooltip: 'Total number of votes cast on all ideas'
    },
  ];

  const renderStatCard = (item: typeof stats[0]) => (
    <div key={item.name} className="bg-white overflow-hidden shadow-lg rounded-lg transition duration-300 ease-in-out hover:shadow-xl">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${item.color} rounded-full p-3`}>
            <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate flex items-center">
                {item.name}
                <Tippy content={item.tooltip} theme="light" arrow={false} animation="shift-away">
                  <div className="ml-2">
                    <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-help" />
                  </div>
                </Tippy>
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{item.value.toLocaleString()}</div>
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
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map(renderStatCard)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white overflow-hidden shadow-lg rounded-lg">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                Idea Status Distribution
                <Tippy content="Distribution of ideas across different status categories" theme="light" arrow={false} animation="shift-away">
                  <div className="ml-2">
                    <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-help" />
                  </div>
                </Tippy>
              </h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={Object.entries(ideaStatusCounts).map(([status, count]) => ({ name: status, value: count }))}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-lg rounded-lg">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                Top Categories
                <Tippy content="Categories with the highest number of ideas" theme="light" arrow={false} animation="shift-away">
                  <div className="ml-2">
                    <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-help" />
                  </div>
                </Tippy>
              </h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={topCategories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {topCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg mb-8">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              Weekly Trends
              <Tippy content="Weekly trends of new ideas, users, comments, and votes over the past 4 weeks" theme="light" arrow={false} animation="shift-away">
                <div className="ml-2">
                  <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-help" />
                </div>
              </Tippy>
            </h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={weeklyData}>
                  <XAxis dataKey="week" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="ideas" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="users" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="comments" stroke="#F59E0B" strokeWidth={2} />
                  <Line type="monotone" dataKey="votes" stroke="#EF4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white overflow-hidden shadow-lg rounded-lg">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                Top Users by Ideas
                <Tippy content="Users who have submitted the most ideas" theme="light" arrow={false} animation="shift-away">
                  <div className="ml-2">
                    <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-help" />
                  </div>
                </Tippy>
              </h3>
              <ul className="divide-y divide-gray-200">
                {topUsersByIdeas.map((user, index) => (
                  <li key={user.id} className="py-4 flex items-center">
                    <span className="mr-4 text-lg font-bold">{index + 1}.</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.ideaCount} ideas</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-lg rounded-lg">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                Top Ideas by Votes
                <Tippy content="Ideas that have received the most votes" theme="light" arrow={false} animation="shift-away">
                  <div className="ml-2">
                    <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-help" />
                  </div>
                </Tippy>
              </h3>
              <ul className="divide-y divide-gray-200">
                {topIdeasByVotes.map((idea, index) => (
                  <li key={idea.id} className="py-4 flex items-center">
                    <span className="mr-4 text-lg font-bold">{index + 1}.</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{idea.title}</p>
                      <p className="text-sm text-gray-500">{idea.voteCount} votes</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg mb-8">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              User Engagement
              <Tippy content="Average user engagement metrics" theme="light" arrow={false} animation="shift-away">
                <div className="ml-2">
                  <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-help" />
                </div>
              </Tippy>
            </h3>
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate flex items-center">
                  Avg. Ideas per User
                  <Tippy content="Total ideas divided by total users" theme="light" arrow={false} animation="shift-away">
                    <div className="ml-2">
                      <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-help" />
                    </div>
                  </Tippy>
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{userEngagement.averageIdeasPerUser.toFixed(2)}</dd>
              </div>
              <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate flex items-center">
                Avg. Comments per User
                  <Tippy content="Total comments divided by total users" theme="light" arrow={false} animation="shift-away">
                    <div className="ml-2">
                      <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-help" />
                    </div>
                  </Tippy>
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{userEngagement.averageCommentsPerUser.toFixed(2)}</dd>
              </div>
              <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate flex items-center">
                  Avg. Votes per User
                  <Tippy content="Total votes divided by total users" theme="light" arrow={false} animation="shift-away">
                    <div className="ml-2">
                      <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-help" />
                    </div>
                  </Tippy>
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{userEngagement.averageVotesPerUser.toFixed(2)}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              Idea Success Rate
              <Tippy content="Percentage of approved ideas out of total ideas" theme="light" arrow={false} animation="shift-away">
                <div className="ml-2">
                  <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-help" />
                </div>
              </Tippy>
            </h3>
            <div className="flex items-center">
              <div className="flex-1">
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                    <div 
                      style={{ width: `${ideaSuccessRate}%` }} 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                    ></div>
                  </div>
                </div>
              </div>
              <div className="ml-4 text-2xl font-semibold text-gray-900">{ideaSuccessRate.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;