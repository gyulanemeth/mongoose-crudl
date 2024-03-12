import { InternalServerError } from 'standard-api-errors'

export default async function deleteMany (Model, params) {
  try {
    const filter = Object.assign({}, params)

    const result = await Model.deleteMany(filter)

    return {
      status: 200,
      result: result
    }
  } catch (e) {
    throw new InternalServerError(`${e.name}: ${e.message}`)
  }
}
