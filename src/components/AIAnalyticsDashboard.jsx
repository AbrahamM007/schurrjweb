import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

export default function AIAnalyticsDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState(null);

  useEffect(() => {
    loadSubmissions();
    loadAnalytics();
    loadInsights();
  }, []);

  const loadSubmissions = async () => {
    const { data } = await supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    setSubmissions(data || []);
  };

  const loadAnalytics = async () => {
    const { data } = await supabase
      .from("content_analytics")
      .select("*")
      .order("created_at", { ascending: false });
    setAnalytics(data || []);
  };

  const loadInsights = async () => {
    const { data } = await supabase
      .from("ai_insights")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
    setInsights(data || []);
  };

  const runAnalysis = async (submissionId, analysisType) => {
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission) return;

    setLoading(true);
    setActiveAnalysis(submissionId);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("You must be logged in");
        return;
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-content`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: submission.body,
          title: submission.title || submission.suggested_headline,
          analysisType
        })
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const result = await response.json();

      const analyticsData = {
        content_id: submissionId,
        content_type: "submission",
        ai_category: result.category || "",
        ai_topics: result.topics || result.similarTopics || [],
        readability_score: 0,
        duplicate_score: result.uniquenessScore ? 100 - result.uniquenessScore : 0,
        trending_score: result.trendingScore || 0,
        predicted_engagement: result.engagementScore || 0
      };

      await supabase.from("content_analytics").insert(analyticsData);

      const insightData = {
        insight_type: analysisType,
        insight_data: result,
        related_content_ids: [submissionId]
      };

      await supabase.from("ai_insights").insert(insightData);

      loadAnalytics();
      loadInsights();
      alert(`${analysisType} analysis complete!`);
    } catch (error) {
      console.error("Analysis error:", error);
      alert("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
      setActiveAnalysis(null);
    }
  };

  const generateTrendingReport = async () => {
    setLoading(true);
    try {
      const topicsMap = {};

      submissions.forEach(sub => {
        const words = sub.body?.toLowerCase().split(/\s+/) || [];
        words.forEach(word => {
          if (word.length > 5) {
            topicsMap[word] = (topicsMap[word] || 0) + 1;
          }
        });
      });

      const trendingTopics = Object.entries(topicsMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([topic, count]) => ({ topic, count }));

      const insightData = {
        insight_type: "trending_report",
        insight_data: {
          trendingTopics,
          totalSubmissions: submissions.length,
          generatedAt: new Date().toISOString()
        },
        related_content_ids: submissions.map(s => s.id).slice(0, 10)
      };

      await supabase.from("ai_insights").insert(insightData);
      loadInsights();
      alert("Trending report generated!");
    } catch (error) {
      console.error("Report generation error:", error);
      alert("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const getAnalyticsForSubmission = (submissionId) => {
    return analytics.find(a => a.content_id === submissionId);
  };

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
        AI Content Analytics
      </h2>
      <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
        Intelligent content management with AI-powered insights
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        marginBottom: "2rem"
      }}>
        <div style={{
          padding: "1.5rem",
          background: "rgba(150, 199, 191, 0.1)",
          borderRadius: "8px",
          border: "1px solid rgba(150, 199, 191, 0.3)"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#96c7bf" }}>
            {submissions.length}
          </div>
          <div style={{ fontWeight: 600, marginTop: "0.5rem" }}>
            Total Submissions
          </div>
        </div>
        <div style={{
          padding: "1.5rem",
          background: "rgba(150, 199, 191, 0.1)",
          borderRadius: "8px",
          border: "1px solid rgba(150, 199, 191, 0.3)"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#27ae60" }}>
            {analytics.length}
          </div>
          <div style={{ fontWeight: 600, marginTop: "0.5rem" }}>
            Analyzed Items
          </div>
        </div>
        <div style={{
          padding: "1.5rem",
          background: "rgba(150, 199, 191, 0.1)",
          borderRadius: "8px",
          border: "1px solid rgba(150, 199, 191, 0.3)"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#f39c12" }}>
            {insights.length}
          </div>
          <div style={{ fontWeight: 600, marginTop: "0.5rem" }}>
            AI Insights
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <button
          className="primary-btn"
          onClick={generateTrendingReport}
          disabled={loading || submissions.length === 0}
          style={{ marginRight: "0.6rem" }}
        >
          Generate Trending Report
        </button>
      </div>

      <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1rem" }}>
        Recent Submissions Analysis
      </h3>

      <div className="submission-list">
        {submissions.slice(0, 10).map((sub) => {
          const subAnalytics = getAnalyticsForSubmission(sub.id);
          const isAnalyzing = activeAnalysis === sub.id;

          return (
            <div key={sub.id} className="admin-card">
              <div className="admin-card-main">
                <div style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.5rem" }}>
                  {sub.title || sub.suggested_headline || "Untitled"}
                </div>
                <div className="text-muted" style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                  {sub.category?.toUpperCase()} • {sub.name}
                </div>
                <div style={{ marginBottom: "0.8rem", fontSize: "0.9rem" }}>
                  {sub.body?.slice(0, 150)}...
                </div>

                {subAnalytics && (
                  <div style={{
                    padding: "1rem",
                    background: "rgba(150, 199, 191, 0.1)",
                    borderRadius: "6px",
                    marginTop: "0.8rem"
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
                      AI Analysis Results:
                    </div>
                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.85rem" }}>
                      {subAnalytics.ai_category && (
                        <div>
                          <strong>Category:</strong> {subAnalytics.ai_category}
                        </div>
                      )}
                      {subAnalytics.predicted_engagement > 0 && (
                        <div>
                          <strong>Engagement:</strong> {subAnalytics.predicted_engagement}/100
                        </div>
                      )}
                      {subAnalytics.trending_score > 0 && (
                        <div>
                          <strong>Trending:</strong> {subAnalytics.trending_score}/100
                        </div>
                      )}
                      {subAnalytics.duplicate_score > 0 && (
                        <div>
                          <strong>Uniqueness:</strong> {100 - subAnalytics.duplicate_score}/100
                        </div>
                      )}
                    </div>
                    {subAnalytics.ai_topics && subAnalytics.ai_topics.length > 0 && (
                      <div style={{ marginTop: "0.5rem" }}>
                        <strong>Topics:</strong>
                        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.3rem" }}>
                          {subAnalytics.ai_topics.map((topic, idx) => (
                            <span
                              key={idx}
                              style={{
                                padding: "0.2rem 0.6rem",
                                background: "rgba(150, 199, 191, 0.3)",
                                borderRadius: "10px",
                                fontSize: "0.75rem",
                                fontWeight: 600
                              }}
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="admin-card-actions" style={{ flexDirection: "column", gap: "0.4rem" }}>
                <button
                  className="secondary-btn"
                  onClick={() => runAnalysis(sub.id, "categorize")}
                  disabled={loading}
                  style={{ width: "100%", fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}
                >
                  {isAnalyzing ? "..." : "Categorize"}
                </button>
                <button
                  className="secondary-btn"
                  onClick={() => runAnalysis(sub.id, "trending")}
                  disabled={loading}
                  style={{ width: "100%", fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}
                >
                  {isAnalyzing ? "..." : "Trending"}
                </button>
                <button
                  className="secondary-btn"
                  onClick={() => runAnalysis(sub.id, "engagement")}
                  disabled={loading}
                  style={{ width: "100%", fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}
                >
                  {isAnalyzing ? "..." : "Engagement"}
                </button>
                <button
                  className="secondary-btn"
                  onClick={() => runAnalysis(sub.id, "schedule")}
                  disabled={loading}
                  style={{ width: "100%", fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}
                >
                  {isAnalyzing ? "..." : "Schedule"}
                </button>
                <button
                  className="secondary-btn"
                  onClick={() => runAnalysis(sub.id, "duplicate")}
                  disabled={loading}
                  style={{ width: "100%", fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}
                >
                  {isAnalyzing ? "..." : "Duplicate"}
                </button>
              </div>
            </div>
          );
        })}
        {submissions.length === 0 && (
          <div className="text-muted">No submissions to analyze yet.</div>
        )}
      </div>

      <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginTop: "2rem", marginBottom: "1rem" }}>
        Recent AI Insights
      </h3>

      <div className="submission-list">
        {insights.map((insight) => (
          <div key={insight.id} className="admin-card">
            <div className="admin-card-main">
              <div style={{ fontWeight: 700, marginBottom: "0.5rem", textTransform: "capitalize" }}>
                {insight.insight_type.replace(/_/g, " ")}
              </div>
              <div style={{ fontSize: "0.85rem" }}>
                <pre style={{
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                  fontSize: "0.85rem",
                  background: "rgba(0, 0, 0, 0.05)",
                  padding: "0.8rem",
                  borderRadius: "4px",
                  maxHeight: "200px",
                  overflowY: "auto"
                }}>
                  {JSON.stringify(insight.insight_data, null, 2)}
                </pre>
              </div>
              <div className="text-muted" style={{ fontSize: "0.75rem", marginTop: "0.5rem" }}>
                {new Date(insight.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
        {insights.length === 0 && (
          <div className="text-muted">No insights generated yet. Run some analyses above!</div>
        )}
      </div>
    </div>
  );
}
