import * as Benchmarkify from 'benchmarkify'
import * as fpEither from 'fp-ts/Either'
import * as fpFunction from 'fp-ts/function'
import * as t from 'io-ts'
import * as p from 'io-ts/lib/PathReporter'
import * as zod from 'zod'
import * as ValidatorJs from 'validator.js'
import * as Validator from 'validatorjs'
import * as validate from 'validate.js'
import * as Joi from 'joi'
import Ajv from 'ajv'
import ajvFormat from 'ajv-formats'
import * as mschema from 'mschema'
import * as parambulator from 'parambulator'
import * as yup from 'yup'

const is = ValidatorJs.Assert
const validator = ValidatorJs.validator()
const ajv = new Ajv()
ajvFormat(ajv)

const benchmark = new Benchmarkify('Validators benchmark').printHeader()
const bench = benchmark.createSuite('Simple object')

const obj = {
    name: 'Cyril Urban',
    email: 'cyril.urban@qest.net',
    firstName: 'Qest',
    phone: '731123456',
    age: 25,
}

// ---- io-ts ----
;(() => {
    const validateModel = (raw, type) => {
        const onLeft = () => {
            throw new Error(p.PathReporter.report(type.decode(raw)).toString())
        }

        const res = fpFunction.pipe(
            type.decode(raw),
            fpEither.fold(onLeft, function (toReturn) {
                return toReturn
            }),
        )
        return res
    }

    const validateEmail = (email) => {
        const re =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return re.test(email)
    }

    interface NameBrand {
        readonly Name: unique symbol
    }
    interface EmailBrand {
        readonly Email: unique symbol
    }
    interface AgeBrand {
        readonly Age: unique symbol
    }

    const schema = t.type({
        name: t.brand(t.string, (s): s is t.Branded<string, NameBrand> => s.length >= 4 && s.length <= 25, 'Name'),
        email: t.brand(t.string, (s): s is t.Branded<string, EmailBrand> => validateEmail(s), 'Email'),
        firstName: t.unknown,
        phone: t.unknown,
        age: t.brand(t.number, (n): n is t.Branded<number, AgeBrand> => n >= 18, 'Age'),
    })

    bench.add('io-ts', () => {
        return validateModel(obj, schema)
    })
})()

// ---- zod ----
;(() => {
    const schema = zod.object({
        name: zod.string().min(4).max(25),
        email: zod.string().email(),
        firstName: zod.any(),
        phone: zod.any(),
        age: zod.number().int().min(18),
    })

    bench.add('zod', () => {
        return schema.parse(obj)
    })
})()

// ---- validator.js ----
;(() => {
    const constraints = {
        name: [is.notBlank(), is.ofLength({ min: 4, max: 25 })],
        email: is.email(),
        firstName: is.notBlank(),
        phone: is.notBlank(),
        age: [is.required(), is.greaterThan(18)],
    }

    bench.add('validator.js', () => {
        validator.validate(obj, constraints)
    })
})()

// ---- validate.js ----
;(() => {
    const constraints = {
        name: {
            presence: true,
            length: {
                minimum: 4,
                maximum: 25,
            },
        },
        email: { email: true },
        firstName: { presence: true },
        phone: { presence: true },
        age: {
            numericality: {
                onlyInteger: true,
                greaterThan: 18,
            },
        },
    }

    bench.add('validate.js', () => {
        return validate(obj, constraints)
    })
})()

// ---- validatorjs ----
;(() => {
    const constraints = {
        name: 'required|min:4|max:25',
        email: 'required|email',
        firstName: 'required',
        phone: 'required',
        age: 'required|integer|min:18',
    }

    bench.add('validatorjs', () => {
        const validation = new Validator(obj, constraints)
        return validation.passes()
    })
})()

// ---- joi ----
;(() => {
    const constraints = Joi.object().keys({
        name: Joi.string().min(4).max(25).required(),
        email: Joi.string().email().required(),
        firstName: Joi.required(),
        phone: Joi.required(),
        age: Joi.number().integer().min(18).required(),
    })

    bench.add('joi', () => {
        return constraints.validate(obj)
    })
})()

// ---- ajv ----
;(() => {
    const constraints = {
        properties: {
            name: { type: 'string', minLength: 4, maxLength: 25 },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            phone: { type: 'string' },
            age: { type: 'integer', minimum: 18 },
        },
        required: ['name', 'email', 'firstName', 'phone', 'age'],
    }

    const validate = ajv.compile(constraints)

    bench.add('ajv', () => {
        return validate(obj)
    })
})()

// ---- mschema ----
;(() => {
    const constraints = {
        name: {
            type: 'string',
            minLength: 4,
            maxLength: 25,
        },
        email: 'string',
        firstName: 'string',
        phone: 'string',
        age: {
            type: 'number',
            min: 18,
        },
    }

    bench.add('mschema', () => {
        return mschema.validate(obj, constraints)
    })
})()

// ---- parambulator ----
;(() => {
    const constraints = {
        name: {
            type$: 'string',
            required$: true,
            minlen$: 4,
            maxlen$: 25,
        },
        email: { type$: 'string', required$: true },
        firstName: { type$: 'string', required$: true },
        phone: { type$: 'string', required$: true },
        age: {
            type$: 'number',
            required$: true,
            min$: 18,
        },
    }

    const check = parambulator(constraints)

    bench.add('parambulator', () => {
        return check.validate(obj, (err) => {
            //console.log(err);
        })
    })
})()

// ---- yup ----
;(() => {
    const schema = yup.object().shape({
        name: yup.string().min(4).max(25).required(),
        email: yup.string().email().required(),
        firstName: yup.mixed().required(),
        phone: yup.mixed().required(),
        age: yup.number().integer().min(18).required(),
    })

    bench.add('yup', () => {
        return schema.isValid(obj)
    })
})()

bench.run()
