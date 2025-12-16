import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Workout } from './Workout';
import { Exercise } from './Exercise';

@Entity('workout_exercises')
export class WorkoutExercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  workoutId: string;

  @Column()
  exerciseId: string;

  @Column()
  sets: number;

  @Column()
  reps: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  weight: number; // en kg

  @Column({ default: 60 })
  restTime: number; // en secondes

  @Column({ default: 0 })
  order: number; // ordre dans le workout

  // Relations
  @ManyToOne(() => Workout, workout => workout.workoutExercises, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workoutId' })
  workout: Workout;

  @ManyToOne(() => Exercise, { eager: true })
  @JoinColumn({ name: 'exerciseId' })
  exercise: Exercise;
}