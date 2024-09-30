// Error is a built-in class in js
class ExpressError extends Error{
    constructor(message,statusCode){
        super(); // to inherit all the attributes of Error
        this.message=message;
        this.statusCode=statusCode;
    }
}

module.exports=ExpressError;
