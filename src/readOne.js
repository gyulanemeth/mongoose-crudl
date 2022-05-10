import NotFoundError from './errors/NotFoundError.js'

export default async function readOne (Model, params, query = {}) {
  const select = query.select

  const paramsCopy = Object.assign({}, params)
  const _id = paramsCopy.id
  delete paramsCopy.id

  const filter = { _id, ...paramsCopy }
  const result = await Model.findOne(filter).select(select)
  if (!result) {
    throw new NotFoundError(Model, filter)
  }

  return {
    status: 200,
    result: result.toObject()
  }
}
