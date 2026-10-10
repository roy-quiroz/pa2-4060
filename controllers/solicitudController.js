const Solicitud = require('../models/solicitudModel')

//GET
exports.obtenerSolicitudes = async (req, res, next) => {
    try{
        const solicitudes = await Solicitud.find();
        res.status(200).json({total: solicitudes.length, solicitudes})
    } catch(error){
        next(error)
    }
}

//GET ID
exports.obtenerSolicitudPorId = async (req, res, next) => {
    try{
        const solicitud = await Solicitud.findById(req.params.id);
        if(!solicitud){
            return res.status(404).json({mensaje: 'Solicitud no encontrada'});
        }
        res.status(200).json({solicitud})
    } catch(error){
        next(error)
    }
}

//POST
exports.crearSolicitud = async (req, res, next) => {
    try{
        const {alumno, curso, descripcion, estado} = req.body;
        const nuevaSolicitud = await Solicitud.create({alumno, curso, descripcion, estado});
        res.status(201).json({mensaje: 'Solicitud creada correctamente', solicitud: nuevaSolicitud})
    } catch(error){
        next(error)
    }
}

//PUT (reemplazo completo: exige todos los campos obligatorios)
exports.actualizarSolicitud = async (req, res, next) => {
    try{
        const {alumno, curso, descripcion, estado} = req.body;

        if(!alumno || !curso || !descripcion){
            return res.status(400).json({
                mensaje: 'PUT requiere todos los campos: alumno, curso y descripcion'
            });
        }

        const solicitudActualizada = await Solicitud.findByIdAndUpdate(
            req.params.id,
            {alumno, curso, descripcion, estado: estado ?? 'Pendiente'},
            {new: true, runValidators: true}
        )

        if(!solicitudActualizada){
            return res.status(404).json({mensaje: 'Solicitud no encontrada'})
        }
        res.status(200).json({mensaje: 'Solicitud actualizada correctamente', solicitud: solicitudActualizada})

    } catch(error){
        next(error)
    }
}

//PATCH (actualización parcial)
exports.actualizarSolicitudParcial = async (req, res, next) => {
    try{
        const {alumno, curso, descripcion, estado} = req.body;

        const campos = {};
        if(alumno !== undefined) campos.alumno = alumno;
        if(curso !== undefined) campos.curso = curso;
        if(descripcion !== undefined) campos.descripcion = descripcion;
        if(estado !== undefined) campos.estado = estado;

        if(Object.keys(campos).length === 0){
            return res.status(400).json({
                mensaje: 'Debes enviar al menos un campo para actualizar'
            });
        }

        const solicitudActualizadaParcial = await Solicitud.findByIdAndUpdate(
            req.params.id,
            campos,
            {new: true, runValidators: true}
        )

        if (!solicitudActualizadaParcial) {
            return res.status(404).json({mensaje: 'Solicitud no encontrada'});
        }
        res.status(200).json({mensaje: 'Solicitud modificada correctamente', solicitud: solicitudActualizadaParcial})
    } catch(error){
        next(error)
    }
}

//DELETE
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
