import NotFoundError from './errors/NotFoundError.js'

export default async function deleteOne (Model, params) {
  const paramsCopy = Object.assign({}, params)
  const _id = paramsCopy.id
  delete paramsCopy.id

  const filter = { _id, ...paramsCopy }
  const originalItem = await Model.findOne(filter)
  if (!originalItem) {
    throw new NotFoundError(Model, filter)
  }

  const result = await Model.findOneAndRemove(filter)

  return {
    status: 200,
    result: result.toObject()
  }
}
