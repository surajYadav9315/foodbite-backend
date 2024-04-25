import GlobalError from "./globalError.js";

export default class Validate {
    constructor(obj) {
        this.obj = obj;
        this.errors = [];
        this.data = {};
        this.currentField = undefined;
    }

    field(fieldName) {
        this.currentField = fieldName;

        if (
            typeof this.obj[fieldName] !== 'undefined' &&
            this.obj[fieldName] !== null &&
            this.obj[fieldName] !== ''
        ) {
            this.data[fieldName] = this.obj[fieldName];
        }
        return this;
    }

    required(message) {
        const field = this.currentField;

        if (this.obj[field] === undefined) {
            this.errors.push({
                field,
                message,
            });
        }
        return this;
    }

    check(regex, message) {
        const field = this.currentField;

        if (this.obj[field] === undefined) return this;

        if (!this.obj[field].match(regex)) {
            this.errors.push({
                field,
                message,
            });
        }
        return this;
    }

    equalTo(values, message) {
        const field = this.currentField;
        if (!this.obj[field] === undefined) return this;

        if (!Array.isArray(values)) return this;
        if (!values.includes(this.obj[field])) {
            this.errors.push({
                field,
                message,
            });
        }
        return this;
    }


    checkType(type, message) {
        const field = this.currentField;
        if (this.obj[field] === undefined) return this;

        if (typeof this.obj[field] !== type) {
            this.errors.push({
                field,
                message,
            });
        }
    }

    isNumber(message) {
        this.checkType('number', message);
        return this;
    }

    isString(message) {
        this.checkType('string', message);
        return this;
    }

    isBoolean(message) {
        this.checkType('boolean', message);
        return this;
    }

    isArray(message) {
        const field = this.currentField;
        if (this.obj[field] === undefined) return this;

        if (!Array.isArray(this.obj[field])) {
            this.errors.push({
                field,
                message,
            });
        }
        return this;
    }

    isArrayEmpty(message) {
        const field = this.currentField;

        if (this.obj[field] === undefined) return this;
        if (!Array.isArray(this.obj[field])) return this;

        if (this.obj[field].length < 1) {
            this.errors.push({
                field,
                message,
            });
        }
        return this;
    }

    isDate(message) {
        const field = this.currentField;
        if (this.obj[field] === undefined) return this;

        if (new Date(this.obj[field]).toString() === 'Invalid Date') {
            this.errors.push({
                field,
                message,
            });
        }
        return this;
    }

    isObject(message) {
        this.checkType('object', message);
        return this;
    }

    execute() {
        if (this.errors.length < 1) {
            return this.data;
        }
        throw new GlobalError(400, this.errors)
    }

    validate(callback, message) {
        const field = this.currentField;
        if (this.obj[field] === undefined) return this;

        const result = callback(this.obj[field]);
        if (!result) {
            this.errors.push({
                field,
                message,
            });
        }
        return this;
    }
}
