import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Participation } from './Participation';

@Entity('workouts')
export class Workout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // e.g., 'running', 'cycling', etc.

  @Column({ type: 'timestamp', nullable: true })
  completionDate: Date;

  @Column()
  duration: number; // in minutes

  @Column()
  difficulty: string; // e.g., 'easy', 'medium', 'hard'

  @Column()
  caloriesBurned: number;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  participationId?: string;

  @ManyToOne(() => Participation, { nullable: true })
  @JoinColumn({ name: 'participationId' })
  participation?: Participation;
}