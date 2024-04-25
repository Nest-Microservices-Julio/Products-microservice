
import "dotenv/config";
import * as Joi from "joi";

interface EnvVars {
    PORT: number;
    DATABASE_URL: string;
}

const envsSchema = Joi.object({
    PORT: Joi.number().required(),
    DATABASE_URL: Joi.string().required(),
})
.unknown()

const {error, value} = envsSchema.validate(process.env)

if (error) {
    throw new Error(`Config validation error: ${error.message}`)
}

const envsVars: EnvVars = value;

export const envs = {
    port: envsVars.PORT,
    databaseUrl: envsVars.DATABASE_URL,
}