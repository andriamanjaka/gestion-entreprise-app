import express from 'express';
import { 
  getAllEmployes, 
  getEmployeById, 
  createEmploye, 
  updateEmploye, 
  deleteEmploye 
} from '../controllers/employeController.js';

const router = express.Router();

// Routes CRUD
router.get('/', getAllEmployes);
router.get('/:id', getEmployeById);
router.post('/', createEmploye);
router.put('/:id', updateEmploye);
router.patch('/:id', updateEmploye);
router.delete('/:id', deleteEmploye);

export default router;
