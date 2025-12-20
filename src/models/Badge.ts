import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, DeleteDateColumn, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './User';

@Entity('badges')
export class Badge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  icon: string; // Icon emoji or identifier

  @Column()
  pointsValue: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column()
  createdBy: string;

  // Relations

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  user: User;
}
