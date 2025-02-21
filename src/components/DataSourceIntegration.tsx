import React, { useState } from 'react';
import { Twitter, Linkedin, Loader2, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAIAnalysis } from '../hooks/useAIAnalysis';
import { useWeb3 } from '../context/Web3Context';
import { Button } from './ui/button';

type AnalysisResult = {
  overall?: number;
  overall_score?: number;
  details: {
    twitter_data?: {
      followers: number;
      following: number;
      tweet_count: number;
      account_age_years: number;
      engagement_rate: number;
      influence_score: number;
      recent_tweets: string[];
      description: string;
    };
    linkedin_data?: {
      connections: number;
      experience_years: number;
      education_level: string;
      skills: string[];
      endorsements: number;
      recommendations: number;
      activity_score: number;
      profile_completion: number;
    };
    document_stats?: {
      word_count: number;
      unique_words: number;
      vocabulary_richness: number;
      avg_word_length: number;
      sentence_count: number;
      avg_sentence_length: number;
      paragraph_count: number;
    };
    content_analysis?: {
      professionalism: number;
      credibility: number;
      sentiment: number;
    };
  };
};

type LinkedInProfile = {
  accessToken: string;
  profileId: string;
};

export const DataSourceIntegration = () => {
  const { account } = useWeb3();
  const { analyzeSocialProfiles, analyzeDocument, isAnalyzing } = useAIAnalysis();
  const [twitterUsername, setTwitterUsername] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);
  const [linkedInProfile, setLinkedInProfile] = useState<LinkedInProfile | null>(null);
  const [isLinkedInConnecting, setIsLinkedInConnecting] = useState(false);

  const handleTwitterAnalysis = async () => {
    if (!twitterUsername) {
      toast.error('Please enter Twitter username');
      return;
    }

    // Clean Twitter username
    let cleanUsername = twitterUsername;
    if (cleanUsername.includes('twitter.com/') || cleanUsername.includes('x.com/')) {
      cleanUsername = cleanUsername.split('/').pop() || '';
    }
    cleanUsername = cleanUsername.replace('@', '');

    if (!cleanUsername) {
      toast.error('Invalid Twitter username');
      return;
    }

    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }

    const loadingToast = toast.loading('Analyzing Twitter profile...');

    try {
      const result = await analyzeSocialProfiles({
        twitter: { username: cleanUsername }
      });

      if (result?.details?.twitter_data) {
        setAnalysisResults(result);
        toast.success('Twitter profile analyzed successfully!', { id: loadingToast });
      } else {
        toast.error('Twitter profile not found or could not be analyzed', { id: loadingToast });
      }
    } catch (error) {
      console.error('Twitter analysis error:', error);
      toast.error('An error occurred during Twitter analysis', { id: loadingToast });
    }
  };

  const handleLinkedInConnect = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLinkedInConnecting(true);
    const loadingToast = toast.loading('Connecting to LinkedIn...');

    try {
      const clientId = process.env.VITE_LINKEDIN_CLIENT_ID;
      const redirectUri = encodeURIComponent(window.location.origin + '/linkedin-callback');
      const scope = encodeURIComponent('r_liteprofile r_emailaddress');
      const state = account;

      const oauthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;

      const width = 600;
      const height = 600;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;
      
      window.open(
        oauthUrl,
        'LinkedIn Connection',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      window.addEventListener('message', async (event) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'LINKEDIN_AUTH_SUCCESS') {
          const { accessToken, profileId } = event.data;
          setLinkedInProfile({ accessToken, profileId });
          
          const result = await analyzeSocialProfiles({
            linkedin: { accessToken, profileId }
          });

          if (result?.details?.linkedin_data) {
            setAnalysisResults((prev) => {
              if (!prev) return result;
              return {
                ...result,
                details: {
                  ...prev.details,
                  linkedin_data: result.details.linkedin_data
                }
              };
            });
            toast.success('LinkedIn profile analyzed successfully!', { id: loadingToast });
          } else {
            toast.error('LinkedIn profile could not be analyzed', { id: loadingToast });
          }
        }
      }, { once: true });

    } catch (error) {
      console.error('LinkedIn connection error:', error);
      toast.error('An error occurred during LinkedIn connection', { id: loadingToast });
    } finally {
      setIsLinkedInConnecting(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
          .includes(file.type)) {
        toast.error('Please upload a PDF, DOCX or TXT file');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDocumentAnalysis = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }

    const loadingToast = toast.loading('Analyzing document...');

    try {
      const result = await analyzeDocument(selectedFile);
      if (result?.overall_score) {
        setAnalysisResults(result);
        toast.success('Document analyzed successfully!', { id: loadingToast });
      } else {
        toast.error('Document analysis failed', { id: loadingToast });
      }
    } catch (error) {
      console.error('Document analysis error:', error);
      toast.error('An error occurred during document analysis', { id: loadingToast });
    }
  };

  const renderAnalysisResults = () => {
    if (!analysisResults) return null;

    return (
      <div className="mt-6 space-y-6">
        {analysisResults.details?.twitter_data && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Twitter className="w-5 h-5 text-[#1DA1F2]" />
              Twitter Analysis Results
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p>
                  <span className="text-gray-400">Followers:</span>{' '}
                  <span className="font-medium">{analysisResults.details.twitter_data.followers.toLocaleString()}</span>
                </p>
                <p>
                  <span className="text-gray-400">Following:</span>{' '}
                  <span className="font-medium">{analysisResults.details.twitter_data.following.toLocaleString()}</span>
                </p>
                <p>
                  <span className="text-gray-400">Tweet Count:</span>{' '}
                  <span className="font-medium">{analysisResults.details.twitter_data.tweet_count.toLocaleString()}</span>
                </p>
              </div>
              <div className="space-y-2">
                <p>
                  <span className="text-gray-400">Account Age:</span>{' '}
                  <span className="font-medium">{analysisResults.details.twitter_data.account_age_years.toFixed(1)} years</span>
                </p>
                <p>
                  <span className="text-gray-400">Engagement Rate:</span>{' '}
                  <span className="font-medium">%{(analysisResults.details.twitter_data.engagement_rate * 100).toFixed(2)}</span>
                </p>
                <p>
                  <span className="text-gray-400">Influence Score:</span>{' '}
                  <span className="font-medium">{analysisResults.details.twitter_data.influence_score.toFixed(2)}</span>
                </p>
              </div>
            </div>
            {analysisResults.details.twitter_data.recent_tweets.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Recent Tweets:</h4>
                <div className="space-y-2">
                  {analysisResults.details.twitter_data.recent_tweets.slice(0, 3).map((tweet, index) => (
                    <p key={index} className="text-sm text-gray-300 bg-gray-700 p-3 rounded">
                      {tweet}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {analysisResults.details?.linkedin_data && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Linkedin className="w-5 h-5 text-[#0A66C2]" />
              LinkedIn Analysis Results
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p>
                  <span className="text-gray-400">Connections:</span>{' '}
                  <span className="font-medium">{analysisResults.details.linkedin_data.connections.toLocaleString()}</span>
                </p>
                <p>
                  <span className="text-gray-400">Experience:</span>{' '}
                  <span className="font-medium">{analysisResults.details.linkedin_data.experience_years} years</span>
                </p>
                <p>
                  <span className="text-gray-400">Education:</span>{' '}
                  <span className="font-medium">{analysisResults.details.linkedin_data.education_level}</span>
                </p>
                <p>
                  <span className="text-gray-400">Profile Completion:</span>{' '}
                  <span className="font-medium">%{analysisResults.details.linkedin_data.profile_completion}</span>
                </p>
              </div>
              <div className="space-y-2">
                <p>
                  <span className="text-gray-400">Endorsements:</span>{' '}
                  <span className="font-medium">{analysisResults.details.linkedin_data.endorsements}</span>
                </p>
                <p>
                  <span className="text-gray-400">Recommendations:</span>{' '}
                  <span className="font-medium">{analysisResults.details.linkedin_data.recommendations}</span>
                </p>
                <p>
                  <span className="text-gray-400">Activity Score:</span>{' '}
                  <span className="font-medium">{analysisResults.details.linkedin_data.activity_score.toFixed(2)}</span>
                </p>
              </div>
            </div>
            {analysisResults.details.linkedin_data.skills.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Featured Skills:</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResults.details.linkedin_data.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-700 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {analysisResults.details?.document_stats && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#A8E6CF]" />
              Document Analysis Results
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p>
                  <span className="text-gray-400">Word Count:</span>{' '}
                  <span className="font-medium">{analysisResults.details.document_stats.word_count}</span>
                </p>
                <p>
                  <span className="text-gray-400">Unique Words:</span>{' '}
                  <span className="font-medium">{analysisResults.details.document_stats.unique_words}</span>
                </p>
                <p>
                  <span className="text-gray-400">Vocabulary Richness:</span>{' '}
                  <span className="font-medium">%{(analysisResults.details.document_stats.vocabulary_richness * 100).toFixed(1)}</span>
                </p>
              </div>
              <div className="space-y-2">
                <p>
                  <span className="text-gray-400">Sentence Count:</span>{' '}
                  <span className="font-medium">{analysisResults.details.document_stats.sentence_count}</span>
                </p>
                <p>
                  <span className="text-gray-400">Average Sentence Length:</span>{' '}
                  <span className="font-medium">{analysisResults.details.document_stats.avg_sentence_length.toFixed(1)} words</span>
                </p>
                <p>
                  <span className="text-gray-400">Paragraph Count:</span>{' '}
                  <span className="font-medium">{analysisResults.details.document_stats.paragraph_count}</span>
                </p>
              </div>
            </div>

            {analysisResults.details.content_analysis && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Content Analysis:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Professionalism</p>
                    <div className="flex items-center gap-2">
                      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#A8E6CF]" 
                          style={{ width: `${analysisResults.details.content_analysis.professionalism}%` }}
                        />
                      </div>
                      <span className="text-sm">
                        {analysisResults.details.content_analysis.professionalism.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Credibility</p>
                    <div className="flex items-center gap-2">
                      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#A8E6CF]" 
                          style={{ width: `${analysisResults.details.content_analysis.credibility}%` }}
                        />
                      </div>
                      <span className="text-sm">
                        {analysisResults.details.content_analysis.credibility.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Sentiment Analysis</p>
                    <div className="flex items-center gap-2">
                      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#A8E6CF]" 
                          style={{ width: `${analysisResults.details.content_analysis.sentiment}%` }}
                        />
                      </div>
                      <span className="text-sm">
                        {analysisResults.details.content_analysis.sentiment.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {(analysisResults.overall || analysisResults.overall_score) && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Overall Trust Score</h3>
            <div className="flex items-center gap-4">
              <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${analysisResults.overall ?? analysisResults.overall_score ?? 0}%` }}
                  transition={{ duration: 1 }}
                  className="h-full bg-gradient-to-r from-[#A8E6CF] to-[#8CD3B4]"
                />
              </div>
              <span className="font-medium text-lg">
                {((analysisResults.overall ?? analysisResults.overall_score ?? 0)).toFixed(2)}%
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mb-6">Social Media Analysis</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Twitter Analysis */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <Twitter className="w-6 h-6 text-[#1DA1F2]" />
            <h3 className="text-xl font-semibold">Twitter Analysis</h3>
          </div>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Twitter username (e.g. @username or profile URL)"
              value={twitterUsername}
              onChange={(e) => setTwitterUsername(e.target.value)}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-[#A8E6CF] focus:outline-none"
            />
            <p className="text-sm text-gray-400">
              You can enter username or profile URL.
            </p>
            <Button
              onClick={handleTwitterAnalysis}
              disabled={isAnalyzing || !twitterUsername}
              className="w-full bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                'Analyze Twitter Profile'
              )}
            </Button>
          </div>
        </div>

        {/* LinkedIn Analysis */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <Linkedin className="w-6 h-6 text-[#0A66C2]" />
            <h3 className="text-xl font-semibold">LinkedIn Analysis</h3>
          </div>
          <div className="space-y-4">
            <Button
              onClick={handleLinkedInConnect}
              disabled={isAnalyzing || isLinkedInConnecting}
              className="w-full bg-[#0A66C2] hover:bg-[#084482] text-white"
            >
              {isLinkedInConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                'Connect with LinkedIn'
              )}
            </Button>
            <p className="text-sm text-gray-400">
              Connect with your LinkedIn account to analyze your profile.
            </p>
          </div>
        </div>
      </div>

      {/* Document Analysis */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-6 h-6 text-[#A8E6CF]" />
          <h3 className="text-xl font-semibold">Document Analysis</h3>
        </div>
        <div className="space-y-4">
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileUpload}
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-[#A8E6CF] focus:outline-none"
          />
          <Button
            onClick={handleDocumentAnalysis}
            disabled={isAnalyzing || !selectedFile}
            className="w-full bg-[#A8E6CF] hover:bg-[#8CD3B4] text-black"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              'Analyze Document'
            )}
          </Button>
        </div>
      </div>

      {/* Analysis Results */}
      {renderAnalysisResults()}
    </div>
  );
};