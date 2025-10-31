import { useEffect } from "react";

// Cria ou recupera o ID de usuário anônimo
function getOrCreateUserId(): string {
  let userId = localStorage.getItem("analytics_user_id");
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("analytics_user_id", userId);
  }
  return userId;
}

// Cria ou recupera o ID de sessão
function getOrCreateSessionId(): string {
  let sessionId = sessionStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("analytics_session_id", sessionId);
  }
  return sessionId;
}

export function trackEvent(
  eventType: string,
  metadata?: Record<string, any>,
  productId?: string,
  orderId?: string
) {
  const userId = getOrCreateUserId();
  const sessionId = getOrCreateSessionId();

  fetch("/api/analytics/track", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      eventType,
      userId,
      sessionId,
      productId,
      orderId,
      metadata,
    }),
  }).catch((error) => {
    console.error("Analytics tracking error:", error);
  });
}

export function usePageViewTracking(pageName: string) {
  useEffect(() => {
    trackEvent("page_view", { page: pageName });
  }, [pageName]);
}
