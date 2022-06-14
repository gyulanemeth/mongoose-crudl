import { DatabaseConnectionError, ValidationError } from 'standard-api-errors'

export default async function createOne (Model, params = {}, body = {}) {
  try {
    const item = new Model({ ...body, ...params })
    const result = await item.save()
    return {
      status: 201,
      result: result.toObject()
    }
  } catch (e) {
    if (e.name === 'ValidationError' || e.name === 'CastError') {
      throw new ValidationError(e.message)
    }

    throw new DatabaseConnectionError(`${e.name}: ${e.message}`)
  }
}
