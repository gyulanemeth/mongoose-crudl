import { DatabaseConnectionError, NotFoundError } from 'standard-api-errors'

export default async function deleteOne (Model, params, select = {}) {
  try {
    const paramsCopy = Object.assign({}, params)
    const _id = paramsCopy.id
    delete paramsCopy.id

    const filter = { _id, ...paramsCopy }
    const originalItem = await Model.findOne(filter)
    if (!originalItem) {
      throw new NotFoundError(`${Model.modelName} with ${JSON.stringify(filter)} is not found.`)
    }

    const result = await Model.findOneAndRemove(filter).select(select)

    return {
      status: 200,
      result: result.toObject()
    }
  } catch (e) {
    if (e instanceof NotFoundError) {
      throw e
    }

    throw new DatabaseConnectionError(`${e.name}: ${e.message}`)
  }
}
