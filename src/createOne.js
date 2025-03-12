import { ConflictError, InternalServerError, ValidationError } from 'standard-api-errors'

export default async function createOne (Model, params = {}, body = {}, populate) {
  try {
    const item = new Model({ ...body, ...params })
    let result = await item.save()
    if (populate) {
      result = await result.populate(populate)
    }
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
