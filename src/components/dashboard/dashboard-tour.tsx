"use client";

import { AnimatePresence, motion } from "framer-motion";
import { type CSSProperties, useCallback, useEffect, useMemo, useState } from "react";

type DashboardTourProps = {
  enabled: boolean;
};

type SpotlightRect = {
  height: number;
  left: number;
  top: number;
  width: number;
};

const steps = [
  {
    targetId: "sidebar-brand",
    title: "Bitbash Sentry",
    body: "WELCOME OPERATIVE. THIS IS THE BITBASH CRYPTO SENTRY, YOUR HIGH-PERFORMANCE MARKET SURVEILLANCE HUB.",
  },
  {
    targetId: "nav-dashboard",
    title: "Dashboard",
    body: "THIS PRIMARY NODE DISPLAYS PORTFOLIO SIGNALS, MARKET MOVEMENT, ALERTS, AND LIVE SURVEILLANCE PANELS.",
  },
  {
    targetId: "nav-watchlist",
    title: "Watchlist",
    body: "TRACK PRIORITY ASSETS FROM THIS ROUTE. FULL ADD AND REMOVE CONTROLS ARRIVE IN THE WATCHLIST MODULE.",
  },
  {
    targetId: "nav-alerts",
    title: "Alerts",
    body: "REVIEW TRIGGERED PRICE CONDITIONS AND SYSTEM NOTIFICATIONS FROM THE ALERTS CONTROL SURFACE.",
  },
  {
    targetId: "nav-market-data",
    title: "Market Data",
    body: "ACCESS INGESTED COIN DATA, PRICE SNAPSHOTS, AND MARKET FEEDS FROM THE MARKET DATA CHANNEL.",
  },
  {
    targetId: "nav-settings",
    title: "Settings",
    body: "SYSTEM PREFERENCES, SECURITY CONTROLS, AND FUTURE CONFIGURATION OPTIONS LIVE IN SETTINGS.",
  },
  {
    targetId: "sidebar-user",
    title: "User Instance",
    body: "THIS CHIP CONFIRMS THE ACTIVE SESSION AND PROVIDES A QUICK EXIT CONTROL FOR SECURE LOGOUT.",
  },
  {
    targetId: "dashboard-card-cluster",
    title: "Dashboard Cards",
    body: "THE COMMAND CENTER CARDS COMBINE PORTFOLIO VALUE, PRICE SURVEILLANCE, SENTIMENT SCANS, MARKET CHANGE, AND LIVE ALERTS.",
  },
];

const fallbackTargetIdByStep: Record<string, string> = {
  "sidebar-brand": "sidebar-navigation",
  "nav-dashboard": "sidebar-navigation",
  "nav-watchlist": "sidebar-navigation",
  "nav-alerts": "sidebar-navigation",
  "nav-market-data": "sidebar-navigation",
  "nav-settings": "sidebar-navigation",
  "sidebar-user": "sidebar-navigation",
  "dashboard-card-cluster": "portfolio-summary",
};

function isSidebarTargetId(targetId: string) {
  return (
    targetId === "sidebar-brand" ||
    targetId === "sidebar-user" ||
    targetId.startsWith("nav-")
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function DashboardTour({ enabled }: DashboardTourProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const step = steps[stepIndex];
  const isFinalStep = stepIndex === steps.length - 1;

  const updateSpotlight = useCallback(() => {
    const target =
      document.getElementById(step.targetId) ??
      document.getElementById(fallbackTargetIdByStep[step.targetId] ?? "");

    if (!target) {
      setSpotlight(null);
      return;
    }

    const rect = target.getBoundingClientRect();

    if (rect.width <= 0 || rect.height <= 0) {
      const fallbackTarget = document.getElementById(
        fallbackTargetIdByStep[step.targetId] ?? "",
      );

      if (!fallbackTarget) {
        setSpotlight(null);
        return;
      }

      const fallbackRect = fallbackTarget.getBoundingClientRect();

      if (fallbackRect.width <= 0 || fallbackRect.height <= 0) {
        setSpotlight(null);
        return;
      }

      const padding = isSidebarTargetId(step.targetId) ? 3 : 10;
      setSpotlight({
        height: fallbackRect.height + padding * 2,
        left: fallbackRect.left - padding,
        top: fallbackRect.top - padding,
        width: fallbackRect.width + padding * 2,
      });
      return;
    }

    const padding = isSidebarTargetId(step.targetId) ? 3 : 10;
    setSpotlight({
      height: rect.height + padding * 2,
      left: rect.left - padding,
      top: rect.top - padding,
      width: rect.width + padding * 2,
    });
  }, [step.targetId]);

  useEffect(() => {
    if (!enabled || dismissed) {
      return;
    }

    updateSpotlight();
    window.addEventListener("resize", updateSpotlight);
    window.addEventListener("scroll", updateSpotlight, true);

    return () => {
      window.removeEventListener("resize", updateSpotlight);
      window.removeEventListener("scroll", updateSpotlight, true);
    };
  }, [dismissed, enabled, updateSpotlight]);

  const cardPosition = useMemo(() => {
    const cardWidth = 390;
    const cardHeight = 260;
    const margin = 18;
    const viewportWidth =
      typeof window === "undefined" ? 1200 : window.innerWidth;
    const viewportHeight =
      typeof window === "undefined" ? 800 : window.innerHeight;

    if (!spotlight) {
      return {
        left: clamp(
          viewportWidth / 2 - cardWidth / 2,
          margin,
          viewportWidth - cardWidth - margin,
        ),
        top: clamp(
          viewportHeight / 2 - cardHeight / 2,
          margin,
          viewportHeight - cardHeight - margin,
        ),
      };
    }

    const sidebarCardGap = 36;
    const placeRight = spotlight.left + spotlight.width + cardWidth + margin <
      viewportWidth;
    const isSidebarTarget = spotlight.left < 320;
    const left = placeRight
      ? spotlight.left + spotlight.width + (isSidebarTarget ? sidebarCardGap : margin)
      : spotlight.left - cardWidth - margin;

    return {
      left: clamp(left, margin, viewportWidth - cardWidth - margin),
      top: clamp(
        isSidebarTarget
          ? spotlight.top
          : spotlight.top + spotlight.height / 2 - cardHeight / 2,
        margin,
        viewportHeight - cardHeight - margin,
      ),
    };
  }, [spotlight]);

  const maskStyle = spotlight
    ? ({
        "--spotlight-height": `${spotlight.height}px`,
        "--spotlight-left": `${spotlight.left}px`,
        "--spotlight-top": `${spotlight.top}px`,
        "--spotlight-width": `${spotlight.width}px`,
      } as CSSProperties)
    : undefined;

  async function completeTour() {
    setDismissed(true);

    await fetch("/api/dashboard/tutorial/complete", {
      method: "POST",
    }).catch(() => undefined);
  }

  function handlePrimaryAction() {
    if (isFinalStep) {
      void completeTour();
      return;
    }

    setStepIndex((currentStep) => currentStep + 1);
  }

  return (
    <AnimatePresence>
      {enabled && !dismissed ? (
        <>
          {spotlight ? (
            <>
              <motion.div
                animate={{ opacity: 1 }}
                className="dashboard-tour-mask"
                initial={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                style={maskStyle}
                transition={{ damping: 24, stiffness: 260, type: "spring" }}
              />
              <motion.div
                animate={{
                  height: spotlight.height,
                  left: spotlight.left,
                  top: spotlight.top,
                  width: spotlight.width,
                }}
                className="dashboard-tour-spotlight"
                exit={{ opacity: 0, scale: 0.98 }}
                initial={{
                  height: spotlight.height,
                  left: spotlight.left,
                  opacity: 0,
                  top: spotlight.top,
                  width: spotlight.width,
                }}
                transition={{ damping: 24, stiffness: 260, type: "spring" }}
              />
            </>
          ) : null}

          <motion.aside
            animate={{
              left: cardPosition.left,
              opacity: 1,
              scale: 1,
              top: cardPosition.top,
              y: 0,
            }}
            className="dashboard-tour-card"
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            initial={{
              left: cardPosition.left,
              opacity: 0,
              scale: 0.97,
              top: cardPosition.top,
              y: 14,
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="dashboard-tour-header">
              <span className="dashboard-tour-icon" aria-hidden="true">
                !
              </span>
              <div>
                <strong>BITBASH COMMAND CENTER</strong>
                <span>
                  STEP {stepIndex + 1} / {steps.length}
                </span>
              </div>
            </div>

            <h3>{step.title}</h3>
            <p>{step.body}</p>

            <div className="dashboard-tour-progress" aria-hidden="true">
              {steps.map((tourStep, index) => (
                <span
                  className={index <= stepIndex ? "active" : undefined}
                  key={tourStep.targetId}
                />
              ))}
            </div>

            <div className="dashboard-tour-actions">
              <button onClick={() => void completeTour()} type="button">
                Skip Induction
              </button>
              <button className="primary" onClick={handlePrimaryAction} type="button">
                {isFinalStep ? "Finish ->" : "Got it ->"}
              </button>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
