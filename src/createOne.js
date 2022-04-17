export default async function createOne (Model, params = {}, body = {}) {
  const item = new Model({ ...body, ...params })
  const result = await item.save()
  return {
    status: 201,
    result: result.toObject()
  }
}
