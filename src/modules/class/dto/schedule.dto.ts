import { ValidateNested, IsArray, ValidateIf } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { SessionDto } from './session.dto';

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

// Helper function to transform sessions
const transformSessions = (value: unknown): SessionDto[] | undefined => {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) {
    throw new Error('Invalid sessions format. Expected array.');
  }
  return value as SessionDto[];
};

// Custom decorator for day validation
function ValidateDay() {
  return function (target: any, propertyKey: string) {
    ValidateIf((o) => o[propertyKey] !== undefined)(target, propertyKey);
    IsArray()(target, propertyKey);
    ValidateNested({ each: true })(target, propertyKey);
    Type(() => SessionDto)(target, propertyKey);
    Transform(({ value }) => transformSessions(value))(target, propertyKey);
  };
}

type ScheduleType = {
  [K in DayOfWeek]?: SessionDto[];
};

export class ScheduleDto implements ScheduleType {
  @ValidateDay()
  Monday?: SessionDto[];

  @ValidateDay()
  Tuesday?: SessionDto[];

  @ValidateDay()
  Wednesday?: SessionDto[];

  @ValidateDay()
  Thursday?: SessionDto[];

  @ValidateDay()
  Friday?: SessionDto[];

  @ValidateDay()
  Saturday?: SessionDto[];

  @ValidateDay()
  Sunday?: SessionDto[];
}