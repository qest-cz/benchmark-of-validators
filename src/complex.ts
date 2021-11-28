import * as Benchmarkify from 'benchmarkify'
import * as fpEither from 'fp-ts/Either'
import * as fpFunction from 'fp-ts/function'
import * as t from 'io-ts'
import * as p from 'io-ts/lib/PathReporter'
import * as zod from 'zod'
import * as validate from 'validate.js'
import * as Joi from 'joi'
import Ajv from 'ajv'
import ajvFormat from 'ajv-formats'
import * as yup from 'yup'

const ajv = new Ajv()
ajvFormat(ajv)

const benchmark = new Benchmarkify('Validators benchmark').printHeader()
const bench = benchmark.createSuite('Complex object')

const person = {
    name: 'Cyril Urban', // required string, min 4 chars, max 25 chars
    email: 'cyril.urban@random.com', // required string, email
    company: 'Qest', // optional string
    phone: '731123456', // required string
    age: 25, // required number, min 18
}

const complexPerson = {
    ...person,
    bestFriend: person,
    otherFriends: [person, person, person, person, person]
}

    // ---- joi ----
    ; (() => {
        const personSchema = Joi.object().keys({
            name: Joi.string().min(4).max(25).required(),
            email: Joi.string().email().required(),
            company: Joi.string().optional(),
            phone: Joi.string().required(),
            age: Joi.number().integer().min(18).required(),
        })

        const schema = personSchema.keys({
            bestFriend: personSchema,
            otherFriends: Joi.array().items(personSchema)
        })

        bench.add('joi', () => {
            return schema.validate(complexPerson)
        })
    })()

    // ---- yup ----
    ; (() => {
        const personSchema = yup.object().shape({
            name: yup.string().min(4).max(25).required(),
            email: yup.string().email().required(),
            company: yup.string().optional(),
            phone: yup.string().required(),
            age: yup.number().integer().min(18).required(),
        })

        const schema = personSchema.shape({
            bestFriend: personSchema,
            otherFriends: yup.array(personSchema)
        })

        bench.add('yup', () => {
            return schema.isValid(person)
        })
    })()

    // ---- ajv ----
    ; (() => {
        const personSchema = {
            properties: {
                name: { type: 'string', minLength: 4, maxLength: 25 },
                email: { type: 'string', format: 'email' },
                company: { type: 'string' },
                phone: { type: 'string' },
                age: { type: 'integer', minimum: 18 },
            },
            required: ['name', 'email', 'phone', 'age'],
        }

        const schema = {
            properties: {
                ...personSchema.properties,
                bestFriend: personSchema,
                otherFriends: {
                    type: 'array',
                    items: personSchema
                },
            },
            required: [...personSchema.required, 'bestFriend', 'otherFriends'],
        }

        const validate = ajv.compile(schema)

        bench.add('ajv', () => {
            return validate(complexPerson)
        })
    })()

    // ---- validate.js ----
    ; (() => {
        const personSchema = {
            name: {
                type: 'string',
                presence: true,
                length: {
                    minimum: 4,
                    maximum: 25,
                },
            },
            email: { type: 'string', presence: true, email: true },
            company: { type: 'string', presence: false },
            phone: { type: 'string', presence: true },
            age: {
                numericality: {
                    onlyInteger: true,
                    greaterThan: 18,
                },
                presence: true,
            },
        }

        validate.validators.array = (arrayItems, itemConstraints) => {
            const arrayItemErrors = arrayItems.reduce((errors, item) => {
                const error = validate(item, itemConstraints)
                if (error) return [...errors, { error }]
                return errors
            }, {})

            return arrayItemErrors.length ? { errors: arrayItemErrors } : null
        }

        const schema = {
            ...personSchema,
            'bestFriend.name': personSchema.name,
            'bestFriend.email': personSchema.email,
            'bestFriend.company': personSchema.company,
            'bestFriend.phone': personSchema.phone,
            'bestFriend.age': personSchema.age,
            otherFriends: {
                array: personSchema
            }
        }

        bench.add('validate.js', () => {
            return validate(complexPerson, schema)
        })
    })()

    // ---- io-ts ----
    ; (() => {
        const validateModel = <I, O>(
            raw: I,
            type: t.TypeC<any> | t.PartialC<any> | t.ArrayC<any> | t.IntersectionC<any>,
        ): O => {
            const onLeft = () => {
                throw new Error(p.PathReporter.report(type.decode(raw)).toString())
            }

            return fpFunction.pipe(
                type.decode(raw),
                fpEither.fold(onLeft, function (toReturn) {
                    return toReturn
                }),
            )
        }

        const validateEmail = (email: string) => {
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

        const required = t.type({
            name: t.brand(t.string, (s): s is t.Branded<string, NameBrand> => s.length >= 4 && s.length <= 25, 'Name'),
            email: t.brand(t.string, (s): s is t.Branded<string, EmailBrand> => validateEmail(s), 'Email'),
            phone: t.string,
            age: t.brand(t.number, (n): n is t.Branded<number, AgeBrand> => n >= 18, 'Age'),
        })

        const optional = t.partial({
            company: t.string,
        })

        const personSchema = t.intersection([
            required,
            optional,
        ])

        const schema = t.intersection([
            personSchema,
            t.type({ bestFriend: personSchema }),
            t.type({ otherFriends: t.array(personSchema) }),
        ])

        bench.add('io-ts', () => {
            return validateModel(complexPerson, schema)
        })

        // usage of type
        // type Person = t.TypeOf<typeof schema>
    })()

    // ---- zod ----
    ; (() => {
        const personSchema = zod.object({
            name: zod.string().min(4).max(25),
            email: zod.string().email(),
            company: zod.string().optional(),
            phone: zod.string(),
            age: zod.number().int().min(18),
        })

        const schema = personSchema.merge(zod.object({
            bestFriend: personSchema,
            otherFriends: zod.array(personSchema),
        }))

        bench.add('zod', () => {
            return schema.parse(complexPerson)
        })

        // usage of type
        // type Person = zod.TypeOf<typeof schema>
    })()

bench.run()
