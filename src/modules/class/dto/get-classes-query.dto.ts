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

      if (!/^[a-zA-Z]+(,[a-zA-Z]+)*$/.test(rawValue)) {
        return undefined;
      }

      // Convert string to array
      return rawValue
        .split(',')
        .map((sport) => sport.trim().toLowerCase())
        .filter((sport) => sport.length > 0);
    },
    { toClassOnly: true },
  )
  sports?: string[];
}
