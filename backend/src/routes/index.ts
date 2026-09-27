import { Router } from 'express';
import recommendationRoutes from './recommendation.routes';
import neighborhoodRoutes from './neighborhood.routes';
import metaRoutes from './meta.routes';
import citiesRoutes from './cities.routes';

const router = Router();

router.use('/', recommendationRoutes);
router.use('/neighborhoods', neighborhoodRoutes);
router.use('/meta', metaRoutes);
router.use('/cities', citiesRoutes);

export default router;

