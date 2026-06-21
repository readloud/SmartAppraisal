import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';

const AppraisalResult = ({ result }) => {
  const { suggested_price, price_range, confidence_score, adjustments, components } = result;

  const getConfidenceColor = (score) => {
    if (score >= 70) return 'bg-green-100 text-green-800';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getAdjustmentIcon = (value) => {
    if (value > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (value < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl p-6 border-2 border-primary-200"
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-sm font-medium text-gray-600">Suggested Purchase Price</h4>
          <div className="flex items-end space-x-3 mt-1">
            <span className="text-4xl font-bold text-primary-600">
              Rp {suggested_price.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500 mb-1">
              Range: Rp {price_range.min.toLocaleString()} - Rp {price_range.max.toLocaleString()}
            </span>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-full ${getConfidenceColor(confidence_score)}`}>
          <span className="font-semibold">{confidence_score}%</span>
          <span className="ml-1 text-sm">Confidence</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h5 className="text-sm font-medium text-gray-700 mb-3">Adjustments</h5>
          <div className="space-y-2">
            {Object.entries(adjustments).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">
                  {key.replace(/_/g, ' ')}
                </span>
                <div className="flex items-center space-x-2">
                  {getAdjustmentIcon(value)}
                  <span className={`text-sm font-medium ${value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {value > 0 ? '+' : ''}{value}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h5 className="text-sm font-medium text-gray-700 mb-3">Component Breakdown</h5>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Base Price</span>
              <span className="font-medium">Rp {components.base_price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Condition Score</span>
              <span className="font-medium">{components.physical_condition_score}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Battery Health</span>
              <span className="font-medium">{components.battery_health_score}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Accessories Included</span>
              <span className="font-medium">{components.accessories_count}/7</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Market Transactions</span>
              <span className="font-medium">{components.market_transactions}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center space-x-2 text-sm text-gray-600 bg-white rounded-lg p-3">
        <CheckCircle className="w-5 h-5 text-green-500" />
        <span>
          This recommendation is based on {components.market_transactions} recent transactions 
          and {components.accessories_count}/7 accessories included.
        </span>
      </div>
    </motion.div>
  );
};

export default AppraisalResult;