import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinColumn, JoinTable } from 'typeorm';
import { ChallengeType, ChallengeDifficulty, ChallengeStatus, ChallengeObjectives } from '../types';
import { User } from './User';
import { Gym } from './Gym';
import { Exercise } from './Exercise';

@Entity('challenges')
export class Challenge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: ChallengeType })
  type: ChallengeType;

  @Column({ type: 'enum', enum: ChallengeDifficulty })
  difficulty: ChallengeDifficulty;

  @Column({ type: 'enum', enum: ChallengeStatus, default: ChallengeStatus.ACTIVE })
  status: ChallengeStatus;

  @Column({ type: 'jsonb' }) // Store objectives as JSON
  objectives: ChallengeObjectives;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ nullable: true })
  maxParticipants?: number;

  @Column()
  pointsReward: number;

  @Column({ default: true })
  isPublic: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @Column()
  creatorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @Column({ nullable: true })
  gymId?: string;

  @ManyToOne(() => Gym, { nullable: true })
  @JoinColumn({ name: 'gymId' })
  gym?: Gym;

  @ManyToMany(() => Exercise, (exercise) => exercise.challenges)
  @JoinTable({
    name: 'challenge_exercises',
    joinColumn: { name: 'challengeId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'exerciseId', referencedColumnName: 'id' },
  })
  recommendedExercises: Exercise[];
}
