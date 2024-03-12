import { ConflictError, InternalServerError, ValidationError } from 'standard-api-errors'

export default async function createOne (Model, params = {}, body = {}) {
  try {
    const item = new Model({ ...body, ...params })
    const result = await item.save()
    return {
      status: 201,
      result: result.toObject()
    }
  } catch (e) {
    if (e.code === 11000) {
      throw new ConflictError(e.message)
    }

    if (e.name === 'ValidationError' || e.name === 'CastError') {
      throw new ValidationError(e.message)
    }

    throw new InternalServerError(`${e.name}: ${e.message}`)
  }
}
