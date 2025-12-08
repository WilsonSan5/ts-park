import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { GymStatus } from '../types';
import { User } from './User';
import { Challenge } from './Challenge';

@Entity('gyms')
export class Gym {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column()
  capacity: number;

  @Column({ type: 'simple-array' }) // Simple array for equipment list
  equipment: string[];

  @Column({ type: 'simple-array', nullable: true }) // Exercise types this gym specializes in
  specializedExerciseTypes: string[]; // e.g., ['cardio', 'strength', 'yoga', 'crossfit']

  @Column({ type: 'enum', enum: GymStatus, default: GymStatus.PENDING })
  status: GymStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @Column()
  ownerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @OneToMany(() => Challenge, (challenge) => challenge.gym)
  challenges: Challenge[];
}
