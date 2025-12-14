import { AppDataSource } from '@config/database';
import { ChallengeDifficulty } from '../types/index';
import { Challenge as Challenge } from '../models/Challenge';


export class ChallengeService {
  public async createChallenge(ChallengeData: Challenge) {
    const challengeRepository = AppDataSource.getRepository(Challenge);
    const challenge = challengeRepository.create(ChallengeData);
    const responses = await challengeRepository.save(challenge);
    console.log('Challenge created:', responses);
    return responses; // Return the created challenge data
  }

  public async getAllChallenges() {
    const challengeRepository = AppDataSource.getRepository(Challenge);
    const challenges = await challengeRepository.find();
    return challenges;
  }
}