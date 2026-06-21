import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Clock,
  ArrowUp,
  ArrowDown 
} from 'lucide-react';
import { dashboardApi } from '../../services/api';
import StatsCard from './StatsCard';
import PriceChart from './PriceChart';
import LoadingSpinner from '../common/LoadingSpinner';

const Dashboard = () => {
  const [days, setDays] = useState(30);
  
  const { data: stats, isLoading: statsLoading } = useQuery(
    ['dashboard-stats', days],
    () => dashboardApi.getStats(days),
    { refetchInterval: 30000 }
  );

  const { data: priceTrend } = useQuery(
    ['price-trend', days],
    () => dashboardApi.getPriceTrend({ days }),
    { refetchInterval: 60000 }
  );

  const { data: topModels } = useQuery(
    'top-models',
    () => dashboardApi.getTopModels(5)
  );

  if (statsLoading) return <LoadingSpinner />;

  const statsData = stats?.data || {};
  
  const statCards = [
    {
      title: 'Today\'s Appraisals',
      value: statsData.today_appraisals || 0,
      icon: Clock,
      change: '+12%',
      changeType: 'positive',
      color: 'bg-blue-500'
    },
    {
      title: 'Avg Purchase Price',
      value: `Rp ${(statsData.avg_purchase_price || 0).toLocaleString()}`,
      icon: DollarSign,
      change: '+3.2%',
      changeType: 'positive',
      color: 'bg-green-500'
    },
    {
      title: 'Avg Profit Margin',
      value: `${(statsData.avg_profit_margin || 0).toFixed(1)}%`,
      icon: TrendingUp,
      change: '+2.1%',
      changeType: 'positive',
      color: 'bg-purple-500'
    },
    {
      title: 'Units in Inventory',
      value: statsData.total_inventory || 0,
      icon: Package,
      change: '-8',
      changeType: 'negative',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <div className="flex space-x-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                days === d
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <StatsCard key={index} {...stat} index={index} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Price Trend
          </h3>
          <PriceChart data={priceTrend?.data || []} />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Models
          </h3>
          <div className="space-y-3">
            {topModels?.data?.map((model, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{model.model_name}</p>
                  <p className="text-sm text-gray-500">
                    {model.units_sold} units sold
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    +Rp {model.avg_profit.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {model.avg_days_to_sell} days avg
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Table would go here */}
    </div>
  );
};

export default Dashboard;