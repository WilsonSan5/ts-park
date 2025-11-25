import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './User';
import { Challenge } from './Challenge';

export enum ExerciseDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

@Entity('exercises')
export class Exercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column('text')
  description: string;

  @Column('simple-array')
  muscleGroups: string[]; // e.g., ['chest', 'arms', 'shoulders']

  @Column({
    type: 'enum',
    enum: ExerciseDifficulty,
    default: ExerciseDifficulty.BEGINNER,
  })
  difficulty: ExerciseDifficulty;

  @Column('decimal', { precision: 5, scale: 2, default: 5.0 })
  caloriesPerMinute: number;

  @Column('text', { nullable: true })
  instructions?: string;

  @Column({ nullable: true })
  videoUrl?: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @Column('uuid')
  createdById: string;

  @ManyToOne(() => User, (user) => user.createdExercises)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @ManyToMany(() => Challenge, (challenge) => challenge.recommendedExercises)
  challenges: Challenge[];
}
