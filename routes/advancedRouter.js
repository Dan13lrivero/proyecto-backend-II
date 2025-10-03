import CustomRouter from "./_customRouter.js";
import { requireJwtCookie } from "../middleware/auth.middlewar.js";
import { policies } from "../middleware/policies.middleware.js";
import { Student } from '../config/models/student.model.js';

const router = new CustomRouter({mergeParams: true});

router.params('id', async (req, res, next, id) => {
    try{
        const s = await Student.findById(id).lean();
        req.studentLoader = s || null;
    }catch(_) {
        req.studentLoader = null;
    }
    next();
})

router.get('/students/:id', requireJwtCookie, policies('admin', 'user'), (req, res) => {
    if(!req.studentLoader) return res.status(404).json({error: "Estudiante no encontrado (pre-cargadp)"});
    res.status(200).json({loadedByParams: true, student: req.studentLoader});
    })

    router.group('/v1', (v1) => {
        v1.get('/ping', (req, res) => res.json({ok: true, version: 'v1'}))
    })

    router.group('/students/:id', (sub) => {
        sub.get('/courses', requireJwtCookie, (req, res) => {
            res.json({
                studentId: req.params.id,
                note: "Ejemplo de subrouter con margeparams",
                courses: ["JS Avanzado", "DB Basico"]
            });
        });
    });


    router.get('/boom', async (req,res) => {
        throw new Error("Explosion controlada para demo de manehjor de errores async");
    });

    export default router.router;