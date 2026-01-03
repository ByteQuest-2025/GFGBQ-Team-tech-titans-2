import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

function Header() {
  return (
    <motion.header 
      className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 shadow-lg"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="bg-white/20 backdrop-blur-lg text-white p-3 rounded-xl border border-white/30 shadow-lg"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <Shield size={28} />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                Citation Verifier
              </h1>
              <p className="text-sm text-white/90">
                AI Hallucination Detection System
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="hidden sm:inline text-sm font-medium text-white bg-white/20 backdrop-blur-lg px-4 py-2 rounded-full border border-white/30">
              Team Tech Titans
            </span>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}

export default Header;