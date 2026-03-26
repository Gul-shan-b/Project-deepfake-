import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import GaugeChart from 'react-gauge-chart';
import { LogOut, Activity, FileText, Home, History as HistoryIcon, Copy, CheckCircle } from 'lucide-react';
import { modelAPI } from '../services/api';

export default function Dashboard() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth');
  };

  const calculateWordCount = (str) => {
    return str.trim() ? str.trim().split(/\s+/).length : 0;
  };

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError('Please enter some text to analyze.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    setCopied(false);

    try {
      const data = await modelAPI.analyze(text);
      
      // âœ… CONSOLE LOG CHECK: Verify the data flowing from FastAPI to React
      console.log("ðŸš€ FastAPI Analysis Response:", data);
      if (data.sentence_analysis) {
         console.table(data.sentence_analysis); // Good for visualizing the sentence arrays
      }
      
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze text. Ensure backend is running.');
      console.error("âŒ FastAPI Error:", err.response || err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!result) return;
    const reportText = `--- Deepfake Analysis Report ---
Prediction: ${result.label} (${(result.confidence * 100).toFixed(1)}% Confidence)
Word Count: ${calculateWordCount(text)}
Burstiness Score: ${result.burstiness}
    
Text Analyzed:
${text}`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Activity className="text-indigo-600" /> Deepfake Hub
          </h1>
          <div className="hidden sm:flex gap-4 border-l pl-6 border-gray-300">
            <Link to="/" className="text-indigo-600 flex items-center gap-1 font-medium text-sm transition-colors">
              <Home size={16} /> Dashboard
            </Link>
            <Link to="/history" className="text-gray-600 hover:text-indigo-600 flex items-center gap-1 font-medium text-sm">
              <HistoryIcon size={16} /> Scan History
            </Link>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition"
        >
          <LogOut size={16} /> Logout
        </button>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Input Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <FileText size={20} className="text-gray-500"/> Input Text
            </h2>
            
            {/* Swapping between text area and highlighted text if result exists */}
            {!result ? (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  Paste the text you want to analyze below. We will determine if it was written by an AI or a Human based on Roberta classifications.
                </p>
                <textarea
                  className="w-full h-80 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none font-sans text-sm leading-relaxed"
                  placeholder="Paste article, essay, or snippet here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={loading}
                />
              </>
            ) : (
                <>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-gray-500 font-medium">Detailed Analysis <span className="text-xs font-normal ml-2 bg-red-100 text-red-600 py-1 px-2 rounded">Highlighted AI sentences</span></p>
                  <button 
                    onClick={() => setResult(null)} 
                    className="text-indigo-600 text-sm hover:underline font-medium"
                  >
                    Edit / Analyze New
                  </button>
                </div>
                
                <div className="w-full h-80 p-4 border border-gray-300 rounded-lg overflow-y-auto bg-gray-50 text-sm font-sans leading-relaxed">
                  {result.sentence_analysis?.map((sentenceObj, idx) => (
                      <span 
                        key={idx} 
                        title={`AI Probability: ${(sentenceObj.ai_prob * 100).toFixed(1)}%`}
                        className={`transition-colors duration-200 cursor-help ${
                          sentenceObj.is_ai ? 'bg-red-200 text-red-900 border-b border-red-300 rounded-sm' : ''
                        }`}
                      >
                        {sentenceObj.text}{' '}
                      </span>
                  ))}
                </div>
              </>
            )}

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-500 font-medium">
                Word Count: {calculateWordCount(text)}
              </span>
              
              {!result && (
                <button
                  onClick={handleAnalyze}
                  disabled={loading || text.length === 0}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 font-medium transition"
                >
                  {loading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {loading ? 'Loading...' : 'Analyze Text'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Results & Stats */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md min-h-[400px]">
            <h2 className="text-lg font-semibold mb-6 flex justify-between items-center">
              {result ? (
                <div className="flex items-center gap-3">
                  Analysis Results
                  {result.probabilities.ai > 0.8 && (
                    <span className="px-2.5 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-full border border-red-200">High Risk</span>
                  )}
                  {result.probabilities.ai < 0.2 && (
                    <span className="px-2.5 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full border border-green-200">Human Verified</span>
                  )}
                </div>
              ) : (
                  "Analysis Results"
              )}
              {result && (
                <button onClick={handleCopyReport} className="text-gray-400 hover:text-indigo-600 transition" title="Copy Report">
                   {copied ? <CheckCircle size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
              )}
            </h2>
            
            {!result && !loading && (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <Activity size={48} className="mb-2 opacity-50" />
                <p>Waiting for text analysis...</p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center h-48 text-indigo-500">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-24 w-24 bg-indigo-100 rounded-full mb-4 flex items-center justify-center">
                      <div className="h-16 w-16 bg-indigo-200 rounded-full animate-ping"></div>
                  </div>
                  <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 w-24 bg-gray-200 rounded"></div>
                </div>
              </div>
            )}

            {result && !loading && (
              <div className="animate-fade-in">
                {/* Gauge Chart */}
                <GaugeChart 
                  id="gauge-chart" 
                  nrOfLevels={20} 
                  colors={["#22c55e", "#eab308", "#ef4444"]} 
                  arcWidth={0.3} 
                  percent={result.probabilities.ai} 
                  textColor="#1f2937"
                  formatTextValue={(value) => `${value}% AI Probability`}
                />
                
                <div className="text-center mt-2 mb-8">
                  <h3 className="text-2xl font-bold">
                    {result.label === 'AI' ? (
                      <span className="text-red-600">AI Generated</span>
                    ) : (
                      <span className="text-green-600">Human Written</span>
                    )}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    System Confidence: {(result.confidence * 100).toFixed(1)}%
                  </p>
                </div>

                <hr className="my-6 border-gray-100" />
                
                {/* Statistics Cards Layout */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-4">Linguistic Metrics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    
                    {/* Card 1 */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                      <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Burstiness</span>
                      <span className="text-xl font-bold text-indigo-600 font-mono">{result.burstiness}</span>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                      <span className="text-xs text-gray-500 uppercase tracking-wider mb-1" title="Lower perplexity implies predictability (AI)">Perplexity</span>
                      <span className="text-xl font-bold text-indigo-600 font-mono">{result.perplexity}</span>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                      <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Reading Lvl</span>
                      <span className="text-md font-bold text-indigo-600">{result.reading_grade}</span>
                    </div>

                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}


