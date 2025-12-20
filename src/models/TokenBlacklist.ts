import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

/**
 * TokenBlacklist Entity
 *
 * Stores invalidated JWT tokens to enable server-side logout.
 * When a user logs out, their token is added here and checked
 * on each authenticated request.
 *
 * Tokens are automatically cleaned up after expiration via scheduled job
 * or can be cleaned manually using the expiresAt field.
 */
@Entity('token_blacklist')
export class TokenBlacklist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ unique: true })
  token: string;

  @Column()
  userId: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  blacklistedAt: Date;
}
