import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './User';
import { WorkoutExercise } from './WorkoutExercice';

@Entity('workouts')
export class Workout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column()
  duration: number; // en minutes

  @Column()
  caloriesBurned: number;

  @CreateDateColumn() // Date de la séance
  createdAt: Date;

  // Relations

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => WorkoutExercise, workoutExercise => workoutExercise.workout, { cascade: true })
  workoutExercises: WorkoutExercise[];
}