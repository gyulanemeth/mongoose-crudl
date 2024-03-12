import { InternalServerError, NotFoundError } from 'standard-api-errors'

export default async function readOne (Model, params, query = {}) {
  try {
    const select = query.select

    const paramsCopy = Object.assign({}, params)
    const _id = paramsCopy.id
    delete paramsCopy.id

    const filter = { _id, ...paramsCopy }
    const result = await Model.findOne(filter).select(select)
    if (!result) {
      throw new NotFoundError(`${Model.modelName} with ${JSON.stringify(filter)} is not found.`)
    }

    return {
      status: 200,
      result: result.toObject()
    }
  } catch (e) {
    if (e instanceof NotFoundError) {
      throw e
    }

    throw new InternalServerError(`${e.name}: ${e.message}`)
  }
}
