class error extends Error{
    constructor(status, message){
        super()
        this.message = message
        this.status = status
    }

    static badRequest(message){
        return new error(400,message)
    }

    static unauthorized(message){
        return new error(401, message)
    }

    static forbidden(message){
        return new error(403,message)
    }

    static notFound(message){
        return new error(404,message)
    }

    static unsupportedMedia(message){
        return new error(415,message)
    }

    static internal(message){
        return new error(500,message)
    }

    
}

const errMiddleware = function(err, req, res, next){
    if(err instanceof error){
        return res.status(err.status).json({message:err.message})
    }
    else return res.status(400).json({message:"Unexpected error"})
}

module.exports = {errMiddleware, error}