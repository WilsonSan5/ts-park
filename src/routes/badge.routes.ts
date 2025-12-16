
import { BadgeController } from '../controllers/badge.controller';
import { BadgeService } from '../services/badge.service';

const badgeService = new BadgeService();
const badgeController = new BadgeController(badgeService);

export default badgeController.buildRouter();