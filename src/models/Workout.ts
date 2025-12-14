import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, ManyToMany } from 'typeorm';
import { User } from './User';
import { Exercise } from './Exercise';
import { WorkoutExercise } from 'types/index';

@Entity('workouts')
export class Workout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column()
  duration: number; // in minutes

  @Column()
  caloriesBurned: number;

  @CreateDateColumn() // Date de la séance
  createdAt: Date;

  // Relations

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToMany(() => Exercise)
  exercises: WorkoutExercise[];

}