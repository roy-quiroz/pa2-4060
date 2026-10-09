const Solicitud = require('../models/solicitudModel')

//GET
exports.obtenerSolicitudes = async (req, res) => {
    try{
        const solicitudes = await Solicitud.find();
        res.status(200).json({total: solicitudes.length, solicitudes})
    } catch(error){
        res.status(500).json({mensaje: 'Error al obtener las solicitudes', error: error.message})
    }
} 

//GET ID
exports.obtenerSolicitudPorId = async (req, res) => {
    try{
        const solicitud = await Solicitud.findById(req.params.id);
        if(!solicitud){
            return res.status(404).json({mensaje: 'Solicitud no encontrada'});
        }
        res.status(200).json({solicitud})
    } catch(error){
        res.status(400).json({mensaje: 'ID de solicitud no válida', error: error.message})
    }
} 

//POST
exports.crearSolicitud = async (req, res) => {
    try{
        const nuevaSolicitud = await Solicitud.create(req.body);
        res.status(201).json({mensaje: 'Solicitud creada correctamente', solicitud: nuevaSolicitud})
    } catch(error){
        res.status(400).json({mensaje: 'Error al crear la solicitud, datos incorrectos', error: error.message})
    }
} 

//PUT
exports.actualizarSolicitud = async (req, res) => {
    try{
        const {alumno, curso, descripcion, estado} = req.body;
        const solicitudActualizada = await Solicitud.findByIdAndUpdate(
            req.params.id,{alumno, curso, descripcion, estado},
            {new: true, runValidators: true}
        )

        if(!solicitudActualizada){
            return res.status(404).json({mensaje: 'Solicitud no encontrada'})
        }
        res.status(200).json({mensaje: 'Solicitud actualizada correctamente', solicitud: solicitudActualizada})
    
    } catch(error){
        res.status(400).json({mensaje: 'Error al actualizar, verifique el ID y los datos', error: error.message})
    }
} 

//PATCH
exports.actualizarSolicitudParcial = async (req, res) => {
    try{
        const {alumno, curso, descripcion, estado} = req.body;

        if (
            alumno === undefined &&
            curso === undefined &&
            descripcion === undefined &&
            estado === undefined
        ) {
            return res.status(400).json({
                mensaje: 'Debes enviar al menos un campo para actualizar'
            });
        }
        
        const campos = {};

        if(alumno !== undefined){
            campos.alumno = alumno;
        }
        if(curso !== undefined){
            campos.curso = curso;
        }
        if(descripcion !== undefined){
            campos.descripcion = descripcion;
        }
        if(estado !== undefined){
            campos.estado = estado;
        }
        
        const solicitudActualizadaParcial = await Solicitud.findByIdAndUpdate(
            req.params.id, 
            campos, {new: true, runValidators: true})

        if (!solicitudActualizadaParcial) {
            return res.status(404).json({mensaje: 'Solicitud no encontrada'});
        }
        res.status(200).json({mensaje: 'Solicitud modificada correctamente', solicitud: solicitudActualizadaParcial
        });
    } catch(error){
        res.status(400).json({mensaje: 'Error al modificar la solicitud, verifique el ID y los datos', error: error.message})
    }
} 

//DELETE
exports.eliminarSolicitud = async (req, res) => {
    try{
        const solicitudEliminada = await Solicitud.findByIdAndDelete(req.params.id);

        if (!solicitudEliminada) {
            return res.status(404).json({ mensaje: 'Solicitud no encontrada' });
        }
        res.status(200).json({mensaje: 'Solicitud eliminada correctamente', solicitud: solicitudEliminada})
    
    } catch(error){
        res.status(400).json({mensaje: 'Error al eliminar. ID no válido', error: error.message})
    }
} 

