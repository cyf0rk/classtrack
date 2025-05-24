import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetClassesQueryDto {
  @ApiPropertyOptional({
    description:
      'Sport name or comma-separated list of sports to filter classes by',
    example: 'basketball or basketball,football',
    type: String,
  })
  @IsOptional()
  @Transform(
    ({ key, obj }: { key: string; obj: Record<string, unknown> }) => {
      const rawValue = obj[key] as string | undefined;
      if (!rawValue) return undefined;

      // If format is invalid, return undefined
      if (!/^[a-zA-Z]+(,[a-zA-Z]+)*$/.test(rawValue)) {
        return undefined;
      }

      // Convert string to array and filter out empty strings
      const sports = rawValue
        .split(',')
        .map((sport) => sport.trim().toLowerCase())
        .filter((sport) => sport.length > 0);

      if (sports.length === 0) {
        return undefined;
      }

      return sports;
    },
    { toClassOnly: true },
  )
  sports?: string[];
}
