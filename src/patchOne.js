import NotFoundError from './errors/NotFoundError.js'

export default async function patchOne (Model, params, body) {
  const paramsCopy = Object.assign({}, params)
  const _id = paramsCopy.id
  delete paramsCopy.id

  const filter = { _id, ...paramsCopy }
  const originalItem = await Model.findOne(filter)
  if (!originalItem) {
    throw new NotFoundError(Model, filter)
  }

  const newData = { ...originalItem.toObject(), ...body, _id, ...paramsCopy }
  const newItem = new Model(newData)
  await newItem.validate()

  const result = await Model.findByIdAndUpdate(_id, newData, { new: true })

  return {
    status: 200,
    result: result.toObject()
  }
}
