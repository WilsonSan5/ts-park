import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from './User';
import { Exercise } from './Exercise';

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

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToMany(() => Exercise, (exercise) => exercise.workouts)
  @JoinTable({
    name: 'workout_exercises',
    joinColumn: { name: 'workoutId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'exerciseId', referencedColumnName: 'id' },
  })
  exercises: Exercise[];

}