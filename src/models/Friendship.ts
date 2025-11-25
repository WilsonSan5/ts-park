import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { FriendshipStatus } from '../types';
import { User } from './User';

@Entity('friendships')
export class Friendship {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: FriendshipStatus, default: FriendshipStatus.PENDING })
  status: FriendshipStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true, type: 'timestamp' })
  respondedAt?: Date;

  // Relations
  @Column()
  requesterId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requesterId' })
  requester: User;

  @Column()
  addresseeId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'addresseeId' })
  addressee: User;
}
