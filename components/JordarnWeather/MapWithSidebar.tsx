"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import dynamic from "next/dynamic";
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import WeatherSidebar from "./weather-sidebar";
import WeatherLayerToolbar from "./weather-layer-toolbar";
import type { EnabledMap, ParameterId } from "./MapJordarn";
import type { ForecastLayerId } from "./Animation/ForecastOverlay";

// Leaflet reads `window` while its module is initialized. A Client Component can
// still be pre-rendered by Next.js, so keep the entire map out of the SSR bundle.
const MapJordarn = dynamic(() => import("./MapJordarn"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-slate-200" />,
});

const EMPTY_ENABLED: EnabledMap = {
  temperature: false,
  wind: false,
  humidity: false,
  pressure: false,
  dewpoint: false,
  solarRadiation: false,
};

const EMPTY_FORECAST: Record<ForecastLayerId, boolean> = {
  "forecast-temp": false,
  "forecast-humidity": false,
  "forecast-wind": false,
  "pressure-isolines": false,
  "msl-pressure": false,
  geopotential: false,
  "forecast-dewpoint": false,
  "low-clouds": false,
  "total-clouds": false,
};

type DrawerDrag = {
  pointerId: number;
  startX: number;
  startProgress: number;
  currentProgress: number;
  drawerWidth: number;
  moved: boolean;
};

const clampProgress = (value: number) => Math.min(1, Math.max(0, value));

export default function MapWithSidebar() {
  const locale = useLocale();
  const t = useTranslations("WeatherStation");
  const isRTL = locale === "ar";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dragProgress, setDragProgress] = useState<number | null>(null);
  const [drawerWidth, setDrawerWidth] = useState(320);
  const dragRef = useRef<DrawerDrag | null>(null);
  const suppressClickRef = useRef(false);
  const [currentDate, setCurrentDate] = useState<string>(() =>
    new Date().toLocaleDateString(locale, { day: "numeric", month: "short" }),
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const drawerProgress =
    dragProgress ?? (isSidebarOpen ? 1 : 0);
  const isDragging = dragProgress !== null;
  const visualOpen = drawerProgress >= 0.5;
  const drawerTravel = Math.max(0, drawerWidth - 32) * drawerProgress;

  // track which parameters are enabled
  const [enabled, setEnabled] = useState<EnabledMap>({ ...EMPTY_ENABLED });

  // track which forecast overlay is enabled (single-select handled in sidebar)
  const [enabledForecast, setEnabledForecast] = useState<
    Record<ForecastLayerId, boolean>
  >({
    ...EMPTY_FORECAST,
  });

  const handleToggle = (id: string, on: boolean) => {
    setIsPlaying(false);
    const key = id as ParameterId;
    if (!(key in enabled)) return;
    setEnabled(on ? { ...EMPTY_ENABLED, [key]: true } : { ...EMPTY_ENABLED });
    if (on) setEnabledForecast({ ...EMPTY_FORECAST });
  };

  const handleForecastToggle = (id: ForecastLayerId, on: boolean) => {
    setIsPlaying(false);
    setEnabledForecast(
      on ? { ...EMPTY_FORECAST, [id]: true } : { ...EMPTY_FORECAST },
    );
    if (on) setEnabled({ ...EMPTY_ENABLED });
  };

  useEffect(() => {
    const syncDrawerWidth = () => {
      setDrawerWidth(Math.min(320, Math.max(0, window.innerWidth - 48)));
    };

    syncDrawerWidth();
    window.addEventListener("resize", syncDrawerWidth);
    return () => window.removeEventListener("resize", syncDrawerWidth);
  }, []);

  const handleDrawerPointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    if (event.button !== 0) return;

    const width = Math.min(320, Math.max(0, window.innerWidth - 48));
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startProgress: drawerProgress,
      currentProgress: drawerProgress,
      drawerWidth: width,
      moved: false,
    };
    setDrawerWidth(width);
    setDragProgress(drawerProgress);
  };

  const handleDrawerPointerMove = (
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const physicalDelta = event.clientX - drag.startX;
    const openingDelta = isRTL ? -physicalDelta : physicalDelta;
    const nextProgress = clampProgress(
      drag.startProgress + openingDelta / drag.drawerWidth,
    );

    drag.currentProgress = nextProgress;
    drag.moved ||= Math.abs(physicalDelta) > 4;
    setDragProgress(nextProgress);
    event.preventDefault();
  };

  const finishDrawerDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const progressDelta = drag.currentProgress - drag.startProgress;
    const shouldOpen =
      progressDelta > 0.12
        ? true
        : progressDelta < -0.12
          ? false
          : drag.currentProgress >= 0.5;

    suppressClickRef.current = drag.moved;
    if (drag.moved) {
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }

    dragRef.current = null;
    setIsSidebarOpen(shouldOpen);
    setDragProgress(null);
  };

  const handleDrawerClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    setIsSidebarOpen((open) => !open);
  };

  useEffect(() => {
    // Leaflet measures its container imperatively. Notify it both when the
    // transition starts and after the grid column animation has completed.
    const frame = window.requestAnimationFrame(() => {
      window.dispatchEvent(new Event("resize"));
    });
    const timer = window.setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 320);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [isSidebarOpen]);

  return (
    <div
      className={`weather-map-shell relative grid h-[calc(100dvh-4rem)] min-h-0 overflow-hidden transition-[grid-template-columns] ease-out ${
        isDragging ? "duration-0" : "duration-300"
      }`}
      style={
        {
          "--drawer-column": `${drawerProgress * 20}rem`,
          "--drawer-progress": drawerProgress,
        } as CSSProperties
      }
    >
      <aside
        id="weather-sidebar"
        aria-hidden={drawerProgress === 0}
        className={`weather-drawer absolute inset-y-0 start-0 z-[1250] h-full w-[min(20rem,calc(100vw-3rem))] min-w-0 overflow-hidden shadow-2xl transition-[transform,opacity] ease-out sm:relative sm:z-auto sm:w-auto sm:shadow-none ${
          isDragging ? "duration-0" : "duration-300"
        } ${
          drawerProgress === 0 ? "pointer-events-none" : "pointer-events-auto"
        }`}
        style={
          {
            "--drawer-offset": `${(isRTL ? 1 : -1) * (1 - drawerProgress) * 100}%`,
            opacity: drawerProgress,
          } as CSSProperties
        }
      >
        <WeatherSidebar
          enabled={enabled}
          enabledForecast={enabledForecast}
          onParameterToggle={handleToggle}
          onForecastToggle={handleForecastToggle}
        />
      </aside>

      <div
        className={`weather-toolbar absolute top-3 z-[1150] transition-[inset-inline-start] ease-out ${
          isDragging ? "duration-0" : "duration-300"
        }`}
      >
        <WeatherLayerToolbar
          enabled={enabled}
          enabledForecast={enabledForecast}
          onParameterToggle={handleToggle}
          onForecastToggle={handleForecastToggle}
        />
      </div>

      <button
        type="button"
        aria-controls="weather-sidebar"
        aria-expanded={isSidebarOpen}
        aria-label={
          isSidebarOpen ? t("collapseSidebar") : t("expandSidebar")
        }
        onClick={handleDrawerClick}
        onPointerDown={handleDrawerPointerDown}
        onPointerMove={handleDrawerPointerMove}
        onPointerUp={finishDrawerDrag}
        onPointerCancel={finishDrawerDrag}
        className={`absolute top-1/2 z-[1300] flex h-10 w-10 touch-none select-none items-center justify-center rounded-full border border-blue-300/40 bg-blue-700 text-white shadow-xl transition-[left,right,transform,background-color] ease-out hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 ${
          isDragging
            ? "cursor-grabbing duration-0"
            : "cursor-grab duration-300"
        }`}
        style={{
          [isRTL ? "right" : "left"]: "0.75rem",
          transform: `translateX(${isRTL ? -drawerTravel : drawerTravel}px) translateY(-50%)`,
        }}
      >
        {visualOpen ? (
          isRTL ? (
            <PanelRightClose className="h-5 w-5" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="h-5 w-5" aria-hidden="true" />
          )
        ) : isRTL ? (
          <PanelRightOpen className="h-5 w-5" aria-hidden="true" />
        ) : (
          <PanelLeftOpen className="h-5 w-5" aria-hidden="true" />
        )}
      </button>

      <div className="col-start-2 h-full min-w-0">
        <MapJordarn
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          enabled={enabled}
          enabledForecast={enabledForecast}
        />
      </div>

      <style jsx>{`
        .weather-map-shell {
          grid-template-columns: 0 minmax(0, 1fr);
        }

        .weather-drawer {
          transform: translateX(var(--drawer-offset));
        }

        .weather-toolbar {
          inset-inline-start: 1rem;
        }

        @media (min-width: 640px) {
          .weather-map-shell {
            grid-template-columns: var(--drawer-column) minmax(0, 1fr);
          }

          .weather-drawer {
            transform: none;
            opacity: 1 !important;
          }

          .weather-toolbar {
            inset-inline-start: calc(1rem + var(--drawer-column));
          }
        }
      `}</style>
    </div>
  );
}
