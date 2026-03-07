'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRedirectIfNotAuth } from '@/utils/auth'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  UserProfile,
  SessionDetails,
  Transcript,
  AiMessage,
  getSessionDetails,
  deleteSession,
} from '@/utils/api'
import { translationApi } from '@/utils/translationApi'
import { Languages, Copy, Check } from 'lucide-react'

type ConversationItem = (Transcript & { type: 'transcript' }) | (AiMessage & { type: 'ai_message' });

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">{title}</h2>
        <div className="text-gray-700 space-y-2">
            {children}
        </div>
    </div>
);

function SessionDetailsContent() {
  const userInfo = useRedirectIfNotAuth() as UserProfile | null;
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Translation state
  const [translationEnabled, setTranslationEnabled] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({});
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Fetch translation for a single transcript
  const fetchTranslation = async (text: string, transcriptId: string) => {
    if (!translationEnabled || !text) return;

    try {
      const result = await translationApi.translate(text, targetLanguage);
      if (result.success && result.translatedText) {
        setTranslatedTexts((prev) => ({
          ...prev,
          [transcriptId]: result.translatedText
        }));
      }
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  // Load translation settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      const settings = await translationApi.getSettings();
      if (settings) {
        setTranslationEnabled(settings.enabled);
        setTargetLanguage(settings.language);
      }
      setSettingsLoaded(true);
    };
    loadSettings();
  }, []);

  // Load session details after settings
  useEffect(() => {
    if (userInfo && sessionId && settingsLoaded) {
      const fetchDetails = async () => {
        setIsLoading(true);
        try {
          const details = await getSessionDetails(sessionId as string);
          setSessionDetails(details);

          // Auto-trigger translation if enabled and transcripts exist
          if (translationEnabled && details.transcripts && details.transcripts.length > 0) {
            setShowTranslation(true);
            setIsTranslating(true);
            for (const item of details.transcripts) {
              await fetchTranslation(item.text, item.id);
            }
          }
        } catch (error) {
          console.error('Failed to load session details:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetails();
    }
  }, [userInfo, sessionId, settingsLoaded, translationEnabled, targetLanguage]);

  const handleDelete = async () => {
    if (!sessionId) return;
    if (!window.confirm('Are you sure you want to delete this activity? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await deleteSession(sessionId);
      router.push('/activity');
    } catch (error) {
      alert('Failed to delete activity.');
      setDeleting(false);
      console.error(error);
    }
  };

  const handleCopyTranslation = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleToggleTranslation = () => {
    if (!showTranslation) {
      // If no translations exist yet, trigger translation
      if (Object.keys(translatedTexts).length === 0 && sessionDetails?.transcripts) {
        setIsTranslating(true);
        // Translate all transcripts
        sessionDetails.transcripts.forEach(async (item) => {
          await fetchTranslation(item.text, item.id);
        });
      }
      setShowTranslation(true);
    } else {
      setShowTranslation(false);
    }
  };

  // Listen for translation settings changes
  useEffect(() => {
    const cleanup = translationApi.onSettingsUpdated((settings) => {
      setTranslationEnabled(settings.enabled);
      setTargetLanguage(settings.language);

      // Re-translate if enabled and transcripts exist
      if (settings.enabled && sessionDetails?.transcripts) {
        setTranslatedTexts({});
        sessionDetails.transcripts.forEach(async (item) => {
          await fetchTranslation(item.text, item.id);
        });
      }
    });

    return cleanup;
  }, [sessionDetails]);

  if (!userInfo || isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCF9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading session details...</p>
        </div>
      </div>
    );
  }

  if (!sessionDetails) {
    return (
        <div className="min-h-screen bg-[#FDFCF9] flex items-center justify-center">
            <div className="max-w-4xl mx-auto px-8 py-12 text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-8">Session Not Found</h2>
                <p className="text-gray-600">The requested session could not be found.</p>
                                    <Link href="/activity" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
                        &larr; Back to Activity
                    </Link>
            </div>
        </div>
    )
  }
  
  const askMessages = sessionDetails.ai_messages || [];

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
                <Link href="/activity" className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </Link>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {sessionDetails.session.title || `Conversation on ${new Date(sessionDetails.session.started_at * 1000).toLocaleDateString()}`}
                        </h1>
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                            <span>{new Date(sessionDetails.session.started_at * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            <span>{new Date(sessionDetails.session.started_at * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                            <span className={`capitalize px-2 py-0.5 rounded-full text-xs font-medium ${sessionDetails.session.session_type === 'listen' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                {sessionDetails.session.session_type}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className={`px-4 py-2 rounded text-sm font-medium border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 transition-colors ${deleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {deleting ? 'Deleting...' : 'Delete Activity'}
                    </button>
                </div>

                {sessionDetails.summary && (
                    <Section title="Summary">
                        <p className="text-lg italic text-gray-600 mb-4">"{sessionDetails.summary.tldr}"</p>
                        
                        {sessionDetails.summary.bullet_json && JSON.parse(sessionDetails.summary.bullet_json).length > 0 &&
                            <div className="mt-4">
                                <h3 className="font-semibold text-gray-700 mb-2">Key Points:</h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-600">
                                    {JSON.parse(sessionDetails.summary.bullet_json).map((point: string, index: number) => (
                                        <li key={index}>{point}</li>
                                    ))}
                                </ul>
                            </div>
                        }

                        {sessionDetails.summary.action_json && JSON.parse(sessionDetails.summary.action_json).length > 0 &&
                            <div className="mt-4">
                                <h3 className="font-semibold text-gray-700 mb-2">Action Items:</h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-600">
                                    {JSON.parse(sessionDetails.summary.action_json).map((action: string, index: number) => (
                                        <li key={index}>{action}</li>
                                    ))}
                                </ul>
                            </div>
                        }
                    </Section>
                )}
                
                {sessionDetails.transcripts && sessionDetails.transcripts.length > 0 && (
                    <Section title="Listen: Transcript">
                        {/* Translation Toggle */}
                        <div className="flex items-center gap-2 mb-4">
                            <Languages className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Translated</span>
                            <button
                                onClick={handleToggleTranslation}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    showTranslation ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    showTranslation ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                            </button>
                        </div>

                        {/* Side-by-side transcript display */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Original text - always shown */}
                            <div className="border-b md:border-b-0 md:border-r border-gray-200 pb-4 md:pb-0 md:pr-4">
                                <h3 className="font-semibold text-gray-700 mb-2">Original</h3>
                                <div className="space-y-3">
                                    {sessionDetails.transcripts.map((item) => (
                                        <p key={item.id} className="text-gray-700">
                                            <span className="font-semibold capitalize">{item.speaker}: </span>
                                            {item.text}
                                        </p>
                                    ))}
                                </div>
                            </div>

                            {/* Translated text - shown when enabled */}
                            <div className="pt-4 md:pt-0 md:pl-4">
                                <h3 className="font-semibold text-gray-700 mb-2">Translated</h3>
                                {isTranslating ? (
                                    <div className="flex justify-center items-center h-32">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
                                    </div>
                                ) : showTranslation ? (
                                    <div className="space-y-3">
                                        {sessionDetails.transcripts.map((item) => (
                                            <div key={`translated-${item.id}`} className="flex items-start justify-between group">
                                                <p className="text-gray-700 flex-1">
                                                    <span className="font-semibold capitalize">{item.speaker}: </span>
                                                    {translatedTexts[item.id] || item.text}
                                                </p>
                                                <button
                                                    onClick={() => handleCopyTranslation(translatedTexts[item.id] || item.text, item.id)}
                                                    className="ml-2 p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Copy translation"
                                                >
                                                    {copiedId === item.id ? (
                                                        <Check className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <Copy className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">Enable translation to see translated text</p>
                                )}
                            </div>
                        </div>
                    </Section>
                )}
                
                {askMessages.length > 0 && (
                    <Section title="Ask: Q&A">
                        <div className="space-y-4">
                            {askMessages.map((item) => (
                                <div key={item.id} className={`p-3 rounded-lg ${item.role === 'user' ? 'bg-gray-100' : 'bg-blue-50'}`}>
                                    <p className="font-semibold capitalize text-sm text-gray-600 mb-1">{item.role === 'user' ? 'You' : 'AI'}</p>
                                    <p className="text-gray-800 whitespace-pre-wrap">{item.content}</p>
                                </div>
                            ))}
                        </div>
                    </Section>
                )}
            </div>
        </div>
    </div>
  );
}

export default function SessionDetailsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FDFCF9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SessionDetailsContent />
    </Suspense>
  );
} 