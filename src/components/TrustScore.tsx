import React, { useEffect, useState } from 'react';
import { Info, ChevronDown, ChevronUp, Linkedin, Twitter, Upload, X, Brain, Sparkles, CheckCircle2, AlertCircle, History, Calendar, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import toast from 'react-hot-toast';
import { useWeb3 } from '../context/Web3Context';
import { Button } from './ui/button';

type ScoreProps = {
  label: string;
  score: number;
  info: string;
  details: { label: string; value: number }[];
};

type SocialProfile = {
  platform: 'linkedin' | 'twitter';
  url: string;
  analyzed: boolean;
  scores: {
    [key: string]: number;
  };
};

type AnalysisHistory = {
  id: string;
  date: string;
  type: string;
  score: number;
  change: number;
  details: string;
};

type ScoreDetails = {
  financial: number;
  professional: number;
  social: number;
};

const scores: ScoreProps[] = [
  {
    label: 'Financial',
    score: 90,
    info: 'Based on credit history and financial reliability',
    details: [
      { label: 'Credit Payments', value: 95 },
      { label: 'Financial Stability', value: 85 },
      { label: 'Debt Ratio', value: 90 },
    ],
  },
  {
    label: 'Professional',
    score: 80,
    info: 'Derived from work history and professional references',
    details: [
      { label: 'Work Experience', value: 85 },
      { label: 'References', value: 75 },
      { label: 'Certifications', value: 80 },
    ],
  },
  {
    label: 'Social',
    score: 75,
    info: 'Calculated from social media presence and interactions',
    details: [
      { label: 'Engagement Rate', value: 70 },
      { label: 'Account Verification', value: 85 },
      { label: 'Community Participation', value: 70 },
    ],
  },
];

const analysisHistory: AnalysisHistory[] = [
  {
    id: '1',
    date: '2024-03-15',
    type: 'LinkedIn Profile',
    score: 85,
    change: 5,
    details: 'Improved professional score due to new endorsements and recommendations',
  },
  {
    id: '2',
    date: '2024-03-10',
    type: 'Financial Records',
    score: 90,
    change: 3,
    details: 'Updated credit history and financial stability metrics',
  },
  {
    id: '3',
    date: '2024-03-05',
    type: 'Social Media',
    score: 78,
    change: -2,
    details: 'Minor decrease in engagement metrics',
  },
];

const platformMetrics = {
  linkedin: {
    experience: 'Professional Experience',
    education: 'Education',
    skills: 'Skills & Endorsements',
    recommendations: 'Recommendations',
    activity: 'Professional Activity',
  },
  twitter: {
    influence: 'Influence Score',
    engagement: 'Engagement Rate',
    authenticity: 'Content Authenticity',
    consistency: 'Posting Consistency',
    reach: 'Audience Reach',
  },
};

function AIAnalysisAnimation() {
  return (
    <motion.div 
      className="flex items-center justify-center space-x-3"
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
      }}
    >
      <Brain size={24} className="text-primary" />
      <span className="text-primary">AI Analysis in Progress</span>
      <motion.div
        className="w-2 h-2 bg-primary rounded-full"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [1, 0.5, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          delay: 0.2,
        }}
      />
      <motion.div
        className="w-2 h-2 bg-primary rounded-full"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [1, 0.5, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          delay: 0.4,
        }}
      />
      <motion.div
        className="w-2 h-2 bg-primary rounded-full"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [1, 0.5, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          delay: 0.6,
        }}
      />
    </motion.div>
  );
}

function ScoreCard({ label, score, info, details }: ScoreProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-sidebar rounded-lg p-4 flex-1"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium">{label}</h3>
        <div className="relative">
          <motion.div
            onHoverStart={() => setShowTooltip(true)}
            onHoverEnd={() => setShowTooltip(false)}
          >
            <Info size={16} className="text-primary cursor-help" />
          </motion.div>
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black rounded-lg text-sm w-48 z-10"
              >
                {info}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
        className="relative w-24 h-24 mx-auto mb-4"
      >
        <CircularProgressbar
          value={score}
          text={`${score}%`}
          styles={buildStyles({
            textSize: '24px',
            pathColor: '#A8E6CF',
            textColor: '#fff',
            trailColor: '#A8E6CF33',
          })}
        />
      </motion.div>

      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-primary hover:text-primary/80 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span>{isExpanded ? 'Hide Details' : 'Show Details'}</span>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-2">
              {details.map((detail) => (
                <div key={detail.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{detail.label}</span>
                  <span className="text-sm font-medium">{detail.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SocialMediaAnalysis() {
  const [profiles, setProfiles] = useState<SocialProfile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [profileUrls, setProfileUrls] = useState({ linkedin: '', twitter: '' });
  const [analysisStage, setAnalysisStage] = useState(0);

  const analysisStages = [
    'Extracting profile data...',
    'Analyzing social presence...',
    'Evaluating engagement metrics...',
    'Processing influence scores...',
    'Calculating trust metrics...',
  ];

  const handleAnalyze = () => {
    if (!profileUrls.linkedin && !profileUrls.twitter) {
      toast.error('Please enter at least one profile URL');
      return;
    }

    setIsAnalyzing(true);
    const loadingToast = toast.loading('Initiating social media analysis...');

    // Simulate AI analysis stages
    let currentStage = 0;
    const stageInterval = setInterval(() => {
      if (currentStage < analysisStages.length) {
        setAnalysisStage(currentStage);
        toast.loading(analysisStages[currentStage], { id: loadingToast });
        currentStage++;
      } else {
        clearInterval(stageInterval);
        const newProfiles: SocialProfile[] = [];

        if (profileUrls.linkedin) {
          newProfiles.push({
            platform: 'linkedin',
            url: profileUrls.linkedin,
            analyzed: true,
            scores: {
              experience: 85,
              education: 90,
              skills: 88,
              recommendations: 75,
              activity: 82,
            },
          });
        }

        if (profileUrls.twitter) {
          newProfiles.push({
            platform: 'twitter',
            url: profileUrls.twitter,
            analyzed: true,
            scores: {
              influence: 78,
              engagement: 85,
              authenticity: 92,
              consistency: 70,
              reach: 83,
            },
          });
        }

        setProfiles(newProfiles);
        setIsAnalyzing(false);
        setShowInput(false);
        toast.success('Social media analysis completed!', { id: loadingToast });
      }
    }, 1500);
  };

  return (
    <div className="bg-background rounded-lg p-6 mt-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h3 className="text-xl font-bold">Social Media Analysis</h3>
          <Sparkles className="text-primary" size={20} />
        </div>
        {profiles.length === 0 && !showInput && (
          <motion.button
            onClick={() => setShowInput(true)}
            className="flex items-center space-x-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Upload size={16} />
            <span>Analyze Profiles</span>
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {showInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <div className="bg-sidebar rounded-lg p-4">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Linkedin size={16} className="text-primary" />
                    <label className="text-sm font-medium">LinkedIn Profile URL</label>
                  </div>
                  <input
                    type="text"
                    value={profileUrls.linkedin}
                    onChange={(e) => setProfileUrls({ ...profileUrls, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full bg-background border border-primary/20 rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Twitter size={16} className="text-primary" />
                    <label className="text-sm font-medium">Twitter Profile URL</label>
                  </div>
                  <input
                    type="text"
                    value={profileUrls.twitter}
                    onChange={(e) => setProfileUrls({ ...profileUrls, twitter: e.target.value })}
                    placeholder="https://twitter.com/username"
                    className="w-full bg-background border border-primary/20 rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowInput(false)}
                    className="text-gray-400 hover:text-white px-4 py-2"
                  >
                    Cancel
                  </button>
                  <motion.button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || (!profileUrls.linkedin && !profileUrls.twitter)}
                    className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Start Analysis
                  </motion.button>
                </div>
              </div>
              
              {isAnalyzing && (
                <div className="space-y-4 mt-4">
                  <AIAnalysisAnimation />
                  <div className="space-y-2">
                    {analysisStages.map((stage, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ 
                          opacity: index <= analysisStage ? 1 : 0.5,
                          x: 0,
                        }}
                        className="flex items-center space-x-2"
                      >
                        {index <= analysisStage ? (
                          <CheckCircle2 size={16} className="text-primary" />
                        ) : (
                          <AlertCircle size={16} className="text-gray-500" />
                        )}
                        <span className={index <= analysisStage ? 'text-white' : 'text-gray-500'}>
                          {stage}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {profiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {profiles.map((profile) => (
              <div key={profile.platform} className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  {profile.platform === 'linkedin' ? (
                    <Linkedin size={16} className="text-primary" />
                  ) : (
                    <Twitter size={16} className="text-primary" />
                  )}
                  <span>Profile analyzed: {profile.url}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(profile.scores).map(([key, value]) => (
                    <motion.div
                      key={key}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileHover={{ scale: 1.05 }}
                      className="bg-sidebar rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm capitalize">
                          {platformMetrics[profile.platform][key as keyof typeof platformMetrics['linkedin' | 'twitter']]}
                        </span>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 }}
                          className="relative w-12 h-12"
                        >
                          <CircularProgressbar
                            value={value}
                            text={`${value}%`}
                            styles={buildStyles({
                              textSize: '24px',
                              pathColor: '#A8E6CF',
                              textColor: '#fff',
                              trailColor: '#A8E6CF33',
                            })}
                          />
                        </motion.div>
                      </div>
                      <div className="h-2 bg-background rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${value}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}

            <motion.button
              onClick={() => {
                setProfiles([]);
                setProfileUrls({ linkedin: '', twitter: '' });
                setShowInput(true);
              }}
              className="flex items-center space-x-2 text-primary hover:text-primary/80 text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Upload size={14} />
              <span>Analyze Different Profiles</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AnalysisHistorySection() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-background rounded-lg p-6 mt-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h3 className="text-xl font-bold">Analysis History</h3>
          <History className="text-primary" size={20} />
        </div>
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-primary hover:text-primary/80"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </motion.button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-4 overflow-hidden"
          >
            {analysisHistory.map((item) => (
              <motion.div
                key={item.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                className="bg-sidebar rounded-lg p-4 hover:bg-sidebar/80 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <Calendar size={16} className="text-primary" />
                    <span className="text-sm text-gray-400">
                      {new Date(item.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {item.change >= 0 ? '+' : ''}{item.change}%
                    </span>
                    <ArrowUpRight
                      size={16}
                      className={`transform ${
                        item.change >= 0 ? 'text-green-400' : 'text-red-400 rotate-90'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{item.type}</h4>
                    <p className="text-sm text-gray-400">{item.details}</p>
                  </div>
                  <div className="relative w-12 h-12">
                    <CircularProgressbar
                      value={item.score}
                      text={`${item.score}`}
                      styles={buildStyles({
                        textSize: '28px',
                        pathColor: '#A8E6CF',
                        textColor: '#fff',
                        trailColor: '#A8E6CF33',
                      })}
                    />
                  </div>
                </div>

                <motion.div
                  className="h-1 bg-background rounded-full mt-4 overflow-hidden"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${item.score}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const TrustScore = () => {
  const { web3Service, account, isConnected, isAuthenticated, connect, authenticate } = useWeb3();
  const [overallScore, setOverallScore] = useState<number>(0);
  const [scoreDetails, setScoreDetails] = useState<ScoreDetails>({
    financial: 0,
    professional: 0,
    social: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState({
    financial: false,
    professional: false,
    social: false
  });

  useEffect(() => {
    const fetchScores = async () => {
      if (!isConnected || !isAuthenticated || !web3Service || !account) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await web3Service.getProfile(account);
        
        setOverallScore(Number(profile.overallScore));
        setScoreDetails({
          financial: Number(profile.financialScore),
          professional: Number(profile.professionalScore),
          social: Number(profile.socialScore)
        });
      } catch (error) {
        console.error('Score loading error:', error);
        toast.error('An error occurred while loading scores');
      } finally {
        setIsLoading(false);
      }
    };

    fetchScores();
  }, [isConnected, isAuthenticated, web3Service, account]);

  const toggleDetails = (section: keyof typeof showDetails) => {
    setShowDetails(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!isConnected) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg text-center">
        <p className="text-gray-400 mb-4">Connect your wallet to see your trust score.</p>
        <Button onClick={connect} className="bg-[#A8E6CF] hover:bg-[#8CD3B4] text-black">
          Connect Wallet
        </Button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg text-center">
        <p className="text-gray-400 mb-4">You need to authenticate to see your trust score.</p>
        <Button onClick={authenticate} className="bg-[#A8E6CF] hover:bg-[#8CD3B4] text-black">
          Authenticate
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg text-center">
        <div className="animate-pulse">
          <div className="h-32 w-32 rounded-full bg-gray-700 mx-auto mb-4" />
          <div className="h-4 w-24 bg-gray-700 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Trust Score Overview</h2>

      {/* Main Score */}
      <div className="flex justify-center">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              className="text-gray-700 stroke-current"
              strokeWidth="10"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
            <motion.circle
              className="text-[#A8E6CF] stroke-current"
              strokeWidth="10"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 - (251.2 * overallScore) / 100}
              strokeLinecap="round"
              initial={{ strokeDashoffset: 251.2 }}
              animate={{ strokeDashoffset: 251.2 - (251.2 * overallScore) / 100 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <span className="text-4xl font-bold">{overallScore}</span>
            <span className="text-gray-400 block">/100</span>
          </div>
        </div>
      </div>

      {/* Sub Scores */}
      <div className="grid gap-6">
        {/* Financial Score */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold">Financial</h3>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
            <Button
              onClick={() => toggleDetails('financial')}
              className="bg-transparent hover:bg-gray-700/50 transform transition-transform"
            >
              <ChevronDown className={`w-5 h-5 ${showDetails.financial ? 'rotate-180' : ''}`} />
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${scoreDetails.financial}%` }}
                transition={{ duration: 1 }}
                className="h-full bg-[#A8E6CF]"
              />
            </div>
            <span className="font-medium">{scoreDetails.financial}%</span>
          </div>
          {showDetails.financial && (
            <div className="mt-4 text-sm text-gray-400">
              <p>• Credit history and payment habits</p>
              <p>• Income stability and debt ratio</p>
              <p>• Financial transaction consistency</p>
            </div>
          )}
        </div>

        {/* Professional Score */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold">Professional</h3>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
            <Button
              onClick={() => toggleDetails('professional')}
              className="bg-transparent hover:bg-gray-700/50 transform transition-transform"
            >
              <ChevronDown className={`w-5 h-5 ${showDetails.professional ? 'rotate-180' : ''}`} />
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${scoreDetails.professional}%` }}
                transition={{ duration: 1 }}
                className="h-full bg-[#A8E6CF]"
              />
            </div>
            <span className="font-medium">{scoreDetails.professional}%</span>
          </div>
          {showDetails.professional && (
            <div className="mt-4 text-sm text-gray-400">
              <p>• Work experience and expertise areas</p>
              <p>• Education and certifications</p>
              <p>• Professional achievements and references</p>
            </div>
          )}
        </div>

        {/* Social Score */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold">Social</h3>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
            <Button
              onClick={() => toggleDetails('social')}
              className="bg-transparent hover:bg-gray-700/50 transform transition-transform"
            >
              <ChevronDown className={`w-5 h-5 ${showDetails.social ? 'rotate-180' : ''}`} />
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${scoreDetails.social}%` }}
                transition={{ duration: 1 }}
                className="h-full bg-[#A8E6CF]"
              />
            </div>
            <span className="font-medium">{scoreDetails.social}%</span>
          </div>
          {showDetails.social && (
            <div className="mt-4 text-sm text-gray-400">
              <p>• Social media engagement and reliability</p>
              <p>• Community participation and contributions</p>
              <p>• Communication and collaboration history</p>
            </div>
          )}
        </div>
      </div>

      {/* Score Improvement Tips */}
      <div className="bg-gray-800/50 p-6 rounded-lg">
        <Button
          onClick={() => setShowDetails(prev => ({
            financial: !prev.financial,
            professional: !prev.professional,
            social: !prev.social
          }))}
          className="w-full bg-transparent border border-gray-700 hover:bg-gray-700/50"
        >
          How Can You Improve Your Score?
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};