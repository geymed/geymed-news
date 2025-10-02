import useSWR from "swr";
import dayjs from "dayjs";
import { useState } from "react";

const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function Home() {
  const { data, mutate } = useSWR("/api/news", fetcher, { refreshInterval: 60000 });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [feedConfig, setFeedConfig] = useState<Record<string, boolean>>({});
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const items = data?.items ?? [];
  const updatedAt = data?.updatedAt ? dayjs(data.updatedAt).format("YYYY-MM-DD HH:mm:ss") : "—";

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/refresh");
      const result = await response.json();
      setDebugInfo(result.debug);
      await mutate(); // Refresh the data
    } catch (error) {
      console.error("Failed to refresh:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadFeedConfig = async () => {
    setIsLoadingConfig(true);
    try {
      const response = await fetch("/api/feeds-config");
      const result = await response.json();
      setFeedConfig(result.feeds);
    } catch (error) {
      console.error("Failed to load feed config:", error);
    } finally {
      setIsLoadingConfig(false);
    }
  };

  const updateFeedConfig = async (feed: string, enabled: boolean) => {
    const newConfig = { ...feedConfig, [feed]: enabled };
    setFeedConfig(newConfig);
    
    try {
      await fetch("/api/feeds-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feeds: newConfig })
      });
    } catch (error) {
      console.error("Failed to update feed config:", error);
      // Revert on error
      setFeedConfig(feedConfig);
    }
  };

  // Load feed config when advanced settings are opened
  const handleToggleAdvancedSettings = () => {
    const newShow = !showAdvancedSettings;
    setShowAdvancedSettings(newShow);
    if (newShow && Object.keys(feedConfig).length === 0) {
      loadFeedConfig();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#e2e8f0'
    }}>
      <main style={{
        maxWidth: '1024px',
        margin: '0 auto',
        padding: '24px'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(148, 163, 184, 0.1)',
          padding: '32px',
          marginBottom: '32px',
          border: '1px solid rgba(148, 163, 184, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            alignItems: 'flex-start'
          }}>
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '8px',
                margin: 0,
                textShadow: '0 0 30px rgba(251, 191, 36, 0.3)'
              }}>
                🇮🇱 Hamas–Trump Gaza Deal Tracker 🇺🇸
              </h1>
              <p style={{
                color: '#94a3b8',
                margin: 0,
                fontSize: '16px'
              }}>
                Real-time updates on Israel-Gaza peace negotiations and Trump's mediation efforts
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  background: isRefreshing 
                    ? 'linear-gradient(135deg, #64748b 0%, #475569 100%)' 
                    : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%)',
                  color: 'white',
                  fontWeight: '600',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: isRefreshing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: isRefreshing 
                    ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
                    : '0 10px 15px -3px rgba(59, 130, 246, 0.4), 0 0 0 1px rgba(59, 130, 246, 0.2)',
                  fontSize: '14px'
                }}
              >
                <svg
                  style={{
                    width: '18px',
                    height: '18px',
                    animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {isRefreshing ? "Refreshing..." : "🔄 Refresh News"}
              </button>
              
              <button
                onClick={handleToggleAdvancedSettings}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  background: showAdvancedSettings 
                    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
                    : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                  color: 'white',
                  fontWeight: '600',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                  fontSize: '14px'
                }}
              >
                <svg
                  style={{ width: '18px', height: '18px' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {showAdvancedSettings ? "🔧 Hide Settings" : "⚙️ Advanced Settings"}
              </button>
            </div>
          </div>

          {/* Advanced Settings Panel */}
          {showAdvancedSettings && (
            <div style={{
              marginTop: '20px',
              padding: '24px',
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              borderRadius: '16px',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
            }}>
              <h3 style={{
                color: '#f1f5f9',
                fontSize: '20px',
                fontWeight: '700',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Fetch Statistics & Debug Info
              </h3>

              {debugInfo ? (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {/* Overall Stats */}
                  <div style={{
                    padding: '16px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                  }}>
                    <h4 style={{ color: '#3b82f6', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                      📊 Overall Statistics
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#f1f5f9', fontSize: '24px', fontWeight: '700' }}>{debugInfo.totalFeeds}</div>
                        <div style={{ color: '#94a3b8', fontSize: '12px' }}>Total Feeds</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#10b981', fontSize: '24px', fontWeight: '700' }}>{debugInfo.totalCollected}</div>
                        <div style={{ color: '#94a3b8', fontSize: '12px' }}>Items Collected</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#f59e0b', fontSize: '24px', fontWeight: '700' }}>{debugInfo.totalUnique}</div>
                        <div style={{ color: '#94a3b8', fontSize: '12px' }}>Unique Items</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: debugInfo.errorCount > 0 ? '#ef4444' : '#10b981', fontSize: '24px', fontWeight: '700' }}>{debugInfo.errorCount}</div>
                        <div style={{ color: '#94a3b8', fontSize: '12px' }}>Errors</div>
                      </div>
                    </div>
                  </div>

                  {/* Feed Results */}
                  {debugInfo.feedResults && (
                    <div style={{
                      padding: '16px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      borderRadius: '12px',
                      border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                      <h4 style={{ color: '#10b981', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                        📡 Feed Status
                      </h4>
                      <div style={{ display: 'grid', gap: '8px' }}>
                        {Object.entries(debugInfo.feedResults).map(([feed, result]: [string, any]) => (
                          <div key={feed} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px',
                            background: result.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            borderRadius: '8px',
                            border: `1px solid ${result.success ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: result.success ? '#10b981' : '#ef4444'
                              }} />
                              <span style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: '500' }}>
                                {feed}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {result.success ? (
                                <span style={{ color: '#10b981', fontSize: '14px', fontWeight: '600' }}>
                                  ✅ {result.items} items
                                </span>
                              ) : (
                                <span style={{ color: '#ef4444', fontSize: '12px' }}>
                                  ❌ {result.errors}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontSize: '14px'
                }}>
                  Click "Refresh News" to see fetch statistics and debug information
                </div>
              )}

              {/* Feed Control Section */}
              <div style={{
                marginTop: '20px',
                padding: '16px',
                background: 'rgba(245, 158, 11, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(245, 158, 11, 0.2)'
              }}>
                <h4 style={{ color: '#f59e0b', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  📡 Feed Control
                </h4>
                
                {isLoadingConfig ? (
                  <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                    Loading feed configuration...
                  </div>
                ) : Object.keys(feedConfig).length > 0 ? (
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {Object.entries(feedConfig).map(([feed, enabled]) => (
                      <div key={feed} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px',
                        background: enabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                        borderRadius: '8px',
                        border: `1px solid ${enabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(107, 114, 128, 0.2)'}`
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: enabled ? '#10b981' : '#6b7280'
                          }} />
                          <span style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: '500' }}>
                            {new URL(feed).hostname.replace(/^www\./, '')}
                          </span>
                        </div>
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          gap: '8px'
                        }}>
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => updateFeedConfig(feed, e.target.checked)}
                            style={{
                              width: '16px',
                              height: '16px',
                              accentColor: '#f59e0b'
                            }}
                          />
                          <span style={{ 
                            color: enabled ? '#10b981' : '#6b7280', 
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                    No feed configuration loaded
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            borderRadius: '12px',
            border: '1px solid rgba(148, 163, 184, 0.2)'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#94a3b8',
              margin: 0
            }}>
              Last updated: <span style={{ fontWeight: '600', color: '#fbbf24' }}>{updatedAt}</span>
            </p>
          </div>
        </div>

        {/* News Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {items.length === 0 ? (
            <div style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(148, 163, 184, 0.1)',
              padding: '40px',
              textAlign: 'center',
              border: '1px solid rgba(148, 163, 184, 0.1)'
            }}>
              <div style={{ color: '#64748b', marginBottom: '20px' }}>
                <svg style={{ width: '64px', height: '64px', margin: '0 auto' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#fbbf24',
                marginBottom: '12px',
                margin: 0
              }}>No Israel-Gaza-Trump news found</h3>
              <p style={{
                color: '#94a3b8',
                margin: 0,
                fontSize: '16px'
              }}>Click "🔄 Refresh News" to fetch the latest updates on peace negotiations</p>
            </div>
          ) : (
            items.map((it: any) => (
              <article key={it.link} style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                borderRadius: '20px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(148, 163, 184, 0.1)',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                border: '1px solid rgba(148, 163, 184, 0.1)'
              }}>
                <div style={{ padding: '28px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px'
                  }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      color: 'white',
                      boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
                    }}>
                      📰 {it.source}
                    </span>
                    <span style={{ color: '#64748b' }}>•</span>
                    <span style={{
                      fontSize: '14px',
                      color: '#94a3b8'
                    }}>
                      {it.isoDate ? dayjs(it.isoDate).format("MMM DD, YYYY • HH:mm") : "—"}
                    </span>
                  </div>
                  
                  <h2 style={{
                    fontSize: '22px',
                    fontWeight: '700',
                    color: '#f1f5f9',
                    marginBottom: '16px',
                    lineHeight: '1.3',
                    margin: 0
                  }}>
                    <a 
                      href={it.link} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={{
                        color: 'inherit',
                        textDecoration: 'none',
                        transition: 'color 0.2s ease'
                      }}
                    >
                      {it.title}
                    </a>
                  </h2>
                  
                  {it.summary && (
                    <p style={{
                      color: '#cbd5e1',
                      lineHeight: '1.6',
                      margin: 0,
                      fontSize: '15px'
                    }}>{it.summary}</p>
                  )}
                  
                  <div style={{
                    marginTop: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <a
                      href={it.link}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#fbbf24',
                        fontWeight: '600',
                        fontSize: '14px',
                        textDecoration: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        background: 'rgba(251, 191, 36, 0.1)',
                        border: '1px solid rgba(251, 191, 36, 0.2)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Read full article
                      <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '48px',
          textAlign: 'center',
          padding: '24px',
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(148, 163, 184, 0.1)'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#94a3b8',
            margin: 0,
            marginBottom: '8px'
          }}>
            📡 Data sourced from Reuters, Al Jazeera, Axios, Times of Israel, Haaretz, and AP News
          </p>
          <p style={{
            fontSize: '12px',
            color: '#64748b',
            margin: 0
          }}>
            🎯 Filtered for Israel-Gaza peace negotiations, Trump mediation, and Hamas deal updates
          </p>
        </div>
      </main>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}