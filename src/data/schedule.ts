/**
 * Daily schedule – drives both the day ring (SVG) and the schedule list.
 *
 * [PLACEHOLDER] This is a DRAFT of a typical training day, not the school's real timetable.
 * Replace times and activities with the real schedule and set SCHEDULE_CONFIRMED = true.
 */
export const SCHEDULE_CONFIRMED = false;

export type BlockKind = 'training' | 'practice' | 'meal' | 'rest';

export interface ScheduleBlock {
  start: string; // "HH:MM", school local time (UTC+8)
  end: string;
  kind: BlockKind;
  label: { en: string; zh: string };
}

export const schedule: ScheduleBlock[] = [
  { start: '05:30', end: '06:00', kind: 'practice', label: { en: 'Wake up, quiet sitting', zh: '起床，静坐' } },
  { start: '06:00', end: '07:00', kind: 'training', label: { en: 'Morning training: run, stretching, basics', zh: '早功：跑步、拉伸、基本功' } },
  { start: '07:15', end: '08:00', kind: 'meal', label: { en: 'Breakfast', zh: '早餐' } },
  { start: '08:30', end: '11:30', kind: 'training', label: { en: 'Forms and technique', zh: '套路与技术' } },
  { start: '12:00', end: '12:45', kind: 'meal', label: { en: 'Lunch', zh: '午餐' } },
  { start: '12:45', end: '14:30', kind: 'rest', label: { en: 'Rest', zh: '午休' } },
  { start: '14:30', end: '17:30', kind: 'training', label: { en: 'Afternoon training: program classes', zh: '下午训练：各项目课程' } },
  { start: '18:00', end: '18:45', kind: 'meal', label: { en: 'Dinner', zh: '晚餐' } },
  { start: '19:30', end: '20:30', kind: 'practice', label: { en: 'Evening: Tai Chi, meditation or Chinese', zh: '晚课：太极、冥想或中文' } },
  { start: '21:30', end: '05:30', kind: 'rest', label: { en: 'Lights out', zh: '熄灯休息' } },
];

export const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};
