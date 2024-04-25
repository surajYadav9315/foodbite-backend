class GlobalError {
    constructor(
        statusCode,
        error
    ) {
        this.statusCode = statusCode;
        this.error = error;

        Error.captureStackTrace(this);
    }
}

export default GlobalError;