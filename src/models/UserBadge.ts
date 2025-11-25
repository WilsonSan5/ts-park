import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Badge } from './Badge';

@Entity('user_badges')
export class UserBadge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  awardedAt: Date;

  // Relations
  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  badgeId: string;

  @ManyToOne(() => Badge)
  @JoinColumn({ name: 'badgeId' })
  badge: Badge;
}
