const Solicitud = require('../models/solicitudModel')

// Reglas de permisos (req.usuario viene del middleware verificarToken):
// - estudiante: crea, ve y edita SOLO sus solicitudes, y solo mientras estén "Pendiente".
//               No puede cambiar el estado.
// - admin:      ve todas, edita cualquiera y es el único que cambia el estado o elimina.

const esAdmin = (req) => req.usuario.rol === 'admin';

// Busca la solicitud y verifica que el usuario tenga acceso a ella
const buscarConPermiso = async (req, res) => {
    const solicitud = await Solicitud.findById(req.params.id).populate('usuario', 'nombre email');

    if (!solicitud) {
        res.status(404).json({mensaje: 'Solicitud no encontrada'});
        return null;
    }
    if (!esAdmin(req) && solicitud.usuario?._id.toString() !== req.usuario.id) {
        res.status(403).json({mensaje: 'No tienes permiso para acceder a esta solicitud'});
        return null;
    }
    return solicitud;
}

// Valida las reglas de edición del estudiante
const validarEdicionEstudiante = (req, res, solicitud, estado) => {
    if (esAdmin(req)) return true;

    if (estado !== undefined) {
        res.status(403).json({mensaje: 'Solo un administrador puede cambiar el estado'});
        return false;
    }
    if (solicitud.estado !== 'Pendiente') {
        res.status(409).json({mensaje: `No se puede modificar una solicitud en estado "${solicitud.estado}"`});
        return false;
    }
    return true;
}

//GET
exports.obtenerSolicitudes = async (req, res, next) => {
    try{
        const filtro = esAdmin(req) ? {} : {usuario: req.usuario.id};
        const solicitudes = await Solicitud.find(filtro)
            .populate('usuario', 'nombre email')
            .sort({fechaCreacion: -1});
        res.status(200).json({total: solicitudes.length, solicitudes})
    } catch(error){
        next(error)
    }
}

//GET ID
exports.obtenerSolicitudPorId = async (req, res, next) => {
    try{
        const solicitud = await buscarConPermiso(req, res);
        if(!solicitud) return;
        res.status(200).json({solicitud})
    } catch(error){
        next(error)
    }
}

//POST
exports.crearSolicitud = async (req, res, next) => {
    try{
        const {curso, descripcion} = req.body;

        // El dueño y el nombre se toman del token, no del body.
        // El estado siempre inicia en "Pendiente" (valor por defecto del modelo).
        const nuevaSolicitud = await Solicitud.create({
            usuario: req.usuario.id,
            alumno: req.usuario.nombre,
            curso,
            descripcion
        });
        res.status(201).json({mensaje: 'Solicitud creada correctamente', solicitud: nuevaSolicitud})
    } catch(error){
        next(error)
    }
}

//PUT (reemplazo completo de los datos editables)
exports.actualizarSolicitud = async (req, res, next) => {
    try{
        const {curso, descripcion, estado} = req.body;

        if(!curso || !descripcion){
            return res.status(400).json({
                mensaje: 'PUT requiere todos los campos: curso y descripcion'
            });
        }

        const solicitud = await buscarConPermiso(req, res);
        if(!solicitud) return;
        if(!validarEdicionEstudiante(req, res, solicitud, estado)) return;

        solicitud.curso = curso;
        solicitud.descripcion = descripcion;
        if(esAdmin(req)) solicitud.estado = estado ?? 'Pendiente';

        await solicitud.save(); // save() ejecuta las validaciones del modelo
        res.status(200).json({mensaje: 'Solicitud actualizada correctamente', solicitud})

    } catch(error){
        next(error)
    }
}

//PATCH (actualización parcial)
exports.actualizarSolicitudParcial = async (req, res, next) => {
    try{
        const {curso, descripcion, estado} = req.body;

        if(curso === undefined && descripcion === undefined && estado === undefined){
            return res.status(400).json({
                mensaje: 'Debes enviar al menos un campo para actualizar'
            });
        }

        const solicitud = await buscarConPermiso(req, res);
        if(!solicitud) return;
        if(!validarEdicionEstudiante(req, res, solicitud, estado)) return;

        if(curso !== undefined) solicitud.curso = curso;
        if(descripcion !== undefined) solicitud.descripcion = descripcion;
        if(estado !== undefined) solicitud.estado = estado;

        await solicitud.save();
        res.status(200).json({mensaje: 'Solicitud modificada correctamente', solicitud})
    } catch(error){
        next(error)
    }
}

//DELETE (solo admin, controlado en las rutas con permitirRoles)
exports.eliminarSolicitud = async (req, res, next) => {
    try{
        const solicitudEliminada = await Solicitud.findByIdAndDelete(req.params.id);

        if (!solicitudEliminada) {
            return res.status(404).json({ mensaje: 'Solicitud no encontrada' });
        }
        res.status(200).json({mensaje: 'Solicitud eliminada correctamente', solicitud: solicitudEliminada})

    } catch(error){
        next(error)
    }
}
