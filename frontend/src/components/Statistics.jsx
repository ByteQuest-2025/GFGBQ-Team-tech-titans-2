import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Clock, FileCheck } from 'lucide-react';

function Statistics({ metadata }) {
  const stats = [
    {
      icon: <FileCheck size={24} />,
      label: 'Total Citations',
      value: metadata.total_citations,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50'
    },
    {
      icon: <BarChart3 size={24} />,
      label: 'Accuracy Rate',
      value: `${Math.round((metadata.verified_citations / metadata.total_citations) * 100)}%`,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50'
    },
    {
      icon: <TrendingUp size={24} />,
      label: 'Confidence Score',
      value: `${Math.round(((metadata.verified_citations * 100 + metadata.suspicious_citations * 50) / (metadata.total_citations * 100)) * 100)}%`,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50'
    },
    {
      icon: <Clock size={24} />,
      label: 'Processing Time',
      value: `${metadata.processing_time}s`,
      gradient: 'from-amber-500 to-orange-500',
      bgGradient: 'from-amber-50 to-orange-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className={`bg-gradient-to-br ${stat.bgGradient} rounded-xl p-4 border border-gray-200 shadow-lg`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`bg-gradient-to-br ${stat.gradient} text-white p-2.5 rounded-lg shadow-md`}>
              {stat.icon}
            </div>
          </div>
          <div className={`text-2xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
            {stat.value}
          </div>
          <div className="text-sm text-gray-700 font-medium mt-1">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
}

export default Statistics;