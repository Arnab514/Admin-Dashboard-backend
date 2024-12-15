    // import  {express} from 'express';
    import  {login, logout}  from '../controllers/authController.js';
    import { Router } from 'express';
    const router = Router();

    router.post('/login', login);
    router.post('/logout', logout);

    export default router
