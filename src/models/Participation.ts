import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ParticipationStatus, ChallengeProgress } from '../types';
import { User } from './User';
import { Challenge } from './Challenge';

@Entity('participations')
export class Participation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ParticipationStatus, default: ParticipationStatus.JOINED })
  status: ParticipationStatus;

  @Column({ type: 'jsonb' })
  progress: ChallengeProgress;

  @CreateDateColumn()
  joinedAt: Date;

  @Column({ nullable: true, type: 'timestamp' })
  completedAt?: Date;

  @Column({ default: 0 })
  pointsEarned: number;

  // Relations
  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  challengeId: string;

  @ManyToOne(() => Challenge)
  @JoinColumn({ name: 'challengeId' })
  challenge: Challenge;
}
