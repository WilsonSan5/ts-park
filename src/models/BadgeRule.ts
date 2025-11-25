import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Badge } from './Badge';

@Entity('badge_rules')
export class BadgeRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ruleType: string; // e.g., 'challenges_completed', 'total_calories', 'consecutive_days'

  @Column()
  operator: string; // e.g., '>=', '>', '=', '<', '<='

  @Column()
  targetValue: number;

  @Column()
  description: string;

  // Relations
  @Column()
  badgeId: string;

  @ManyToOne(() => Badge)
  @JoinColumn({ name: 'badgeId' })
  badge: Badge;
}
