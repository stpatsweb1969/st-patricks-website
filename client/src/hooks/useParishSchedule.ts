/**
 * useParishSchedule — React hook for the single source of truth schedule.
 * All components that display Mass times, countdowns, or service info use this hook.
 * Never hardcode schedule data in components.
 */
import { trpc } from "@/lib/trpc";
import {
  parseTimeToMinutes,
  getServicesForDay,
  getWeeklySchedule,
  getCountdown,
  isServiceInProgress,
  getNextService,
  getUpcomingHolyDays,
  generateSEODescription,
  type ParishSchedule,
  type ParishInfo,
  type ScheduledService,
  TIMEZONE,
  DAY_LABELS,
} from "../../../shared/scheduleEngine";

export function useParishSchedule() {
  const { data: schedule, isLoading: scheduleLoading } = trpc.parishSchedule.getSchedule.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 min cache — schedule rarely changes
  });

  return {
    schedule: schedule ?? null,
    isLoading: scheduleLoading,
  };
}

export function useParishInfo() {
  const { data: info, isLoading } = trpc.parishSchedule.getInfo.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  return {
    info: info ?? null,
    isLoading,
  };
}

// Re-export engine utilities so consumers only need one import
export {
  parseTimeToMinutes,
  getServicesForDay,
  getWeeklySchedule,
  getCountdown,
  isServiceInProgress,
  getNextService,
  getUpcomingHolyDays,
  generateSEODescription,
  TIMEZONE,
  DAY_LABELS,
};
export type { ParishSchedule, ParishInfo, ScheduledService };
