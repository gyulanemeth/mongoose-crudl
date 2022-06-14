import { DatabaseConnectionError, NotFoundError, ValidationError } from 'standard-api-errors'

export default async function patchOne (Model, params, body) {
  try {
    const paramsCopy = Object.assign({}, params)
    const _id = paramsCopy.id
    delete paramsCopy.id

    const filter = { _id, ...paramsCopy }
    const originalItem = await Model.findOne(filter)
    if (!originalItem) {
      throw new NotFoundError(`${Model.modelName} with ${JSON.stringify(filter)} is not found.`)
    }

    const newData = { ...originalItem.toObject(), ...body, _id, ...paramsCopy }
    const newItem = new Model(newData)
    await newItem.validate()

    const result = await Model.findByIdAndUpdate(_id, newData, { new: true })

    return {
      status: 200,
      result: result.toObject()
    }
  } catch (e) {
    if (e instanceof NotFoundError) {
      throw e
    }

    if (e.name === 'ValidationError' || e.name === 'CastError') {
      throw new ValidationError(e.message)
    }

    throw new DatabaseConnectionError(`${e.name}: ${e.message}`)
  }
}
