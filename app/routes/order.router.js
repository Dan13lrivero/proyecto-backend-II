import { Router } from "express";
import { requireJwtCookie } from "../middleware/auth.middleware.js";
import { policies } from '../middleware/policies.middleware.js';
import { orderController as ctrl } from '../controllers/order.controller.js';

const router = Router();

// Vistas
router.get('/orders', (req, res) => ctrl.listView(req, res));

// API REST
router.get('/api/orders', requireJwtCookie, policies('admin', 'user'), (req, res) => ctrl.listJSON(req, res));
router.get('/api/orders/code/:code', requireJwtCookie, policies('admin', 'user'), (req, res) => ctrl.getByCode(req, res));
router.get('/api/orders/:id', requireJwtCookie, policies('admin', 'user'), (req, res) => ctrl.getById(req, res));
router.post('/api/orders/', requireJwtCookie, policies('admin'), (req, res) => ctrl.create(req, res));
router.put('/api/orders/:id', requireJwtCookie, policies('admin'), (req, res) => ctrl.update(req, res));
router.delete('/api/orders/:id', requireJwtCookie, policies('admin'), (req, res) => ctrl.remove(req, res));

// Semilla Base
router.post('/api/orders/seed', requireJwtCookie, policies('admin', 'user'), (req, res) => ctrl.seed(req, res));

export default router;
